import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { adminService } from '../../../services/adminService'
import type {
  AdminAreaCatalogItem,
  AdminCatalogs,
  AdminProgramCatalogItem,
  AdminTestCatalogItem,
} from '../../../types'

type CatalogTab = 'areas' | 'programs' | 'tests'
type FormMode = 'create' | 'edit'

interface CatalogFormValues {
  id: string
  name: string
  description: string
  profile: string
  areaId: string
  url: string
  version: string
  questionCount: string
  durationMinutes: string
}

const EMPTY_FORM: CatalogFormValues = {
  id: '',
  name: '',
  description: '',
  profile: '',
  areaId: '',
  url: '',
  version: '',
  questionCount: '',
  durationMinutes: '',
}

const TAB_LABELS: Record<CatalogTab, string> = {
  areas: 'Áreas',
  programs: 'Programas',
  tests: 'Pruebas',
}

function cloneCatalogs(catalogs: AdminCatalogs): AdminCatalogs {
  return {
    areas: catalogs.areas.map((item) => ({ ...item })),
    programs: catalogs.programs.map((item) => ({ ...item })),
    tests: catalogs.tests.map((item) => ({ ...item })),
  }
}

export function AdminCatalogSettingsView() {
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [savedCatalogs, setSavedCatalogs] = useState<AdminCatalogs | null>(null)
  const [catalogs, setCatalogs] = useState<AdminCatalogs | null>(null)
  const [activeTab, setActiveTab] = useState<CatalogTab>('areas')
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<CatalogFormValues>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadingAreaId, setUploadingAreaId] = useState<string | null>(null)
  const [editingPachoPath, setEditingPachoPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true

    void adminService
      .getCatalogs()
      .then((response) => {
        if (!active) {
          return
        }
        const initial = cloneCatalogs(response.data)
        setSavedCatalogs(initial)
        setCatalogs(cloneCatalogs(initial))
        setLoadState('ready')
      })
      .catch(() => {
        if (active) {
          setLoadState('error')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const hasPendingChanges = useMemo(
    () => Boolean(catalogs && savedCatalogs && JSON.stringify(catalogs) !== JSON.stringify(savedCatalogs)),
    [catalogs, savedCatalogs],
  )

  const activeItems = useMemo(() => {
    const items = catalogs?.[activeTab] ?? []
    if (!searchQuery.trim()) return items
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => {
      if (activeTab === 'programs') {
        const areaName = catalogs.areas.find((a) => a.id === (item as AdminProgramCatalogItem).areaId)?.name ?? ''
        return item.name.toLowerCase().includes(query) || areaName.toLowerCase().includes(query)
      }
      if (activeTab === 'tests') {
        const test = item as AdminTestCatalogItem
        return item.name.toLowerCase().includes(query) || test.version.toLowerCase().includes(query)
      }
      return item.name.toLowerCase().includes(query)
    })
  }, [catalogs, activeTab, searchQuery])

  function updateForm(field: keyof CatalogFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: '' }))
    setStatus(null)
  }

  function openCreateForm() {
    setFormMode('create')
    setFormValues(EMPTY_FORM)
    setFormErrors({})
    setStatus(null)
    setEditingPachoPath(null)
  }

  function openEditForm(item: AdminAreaCatalogItem | AdminProgramCatalogItem | AdminTestCatalogItem) {
    setFormMode('edit')
    setFormErrors({})
    setStatus(null)

    if (activeTab === 'areas') {
      const area = item as AdminAreaCatalogItem
      setFormValues({
        ...EMPTY_FORM,
        id: area.id,
        name: area.name,
        description: area.description,
        profile: area.profile,
      })
      setEditingPachoPath(area.pachoPath ?? null)
    } else if (activeTab === 'programs') {
      const program = item as AdminProgramCatalogItem
      setFormValues({
        ...EMPTY_FORM,
        id: program.id,
        name: program.name,
        description: program.description,
        areaId: program.areaId,
        url: program.url ?? '',
      })
    } else {
      const test = item as AdminTestCatalogItem
      setFormValues({
        ...EMPTY_FORM,
        id: test.id,
        name: test.name,
        version: test.version,
        questionCount: String(test.questionCount),
        durationMinutes: String(test.durationMinutes),
      })
    }
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {}
    if (formValues.name.trim().length < 3) {
      nextErrors.name = 'El nombre debe tener al menos 3 caracteres.'
    }

    if (activeTab === 'areas') {
      if (formValues.description.trim().length < 20) {
        nextErrors.description = 'La descripción debe tener al menos 20 caracteres.'
      }
      if (formValues.profile.trim().length < 20) {
        nextErrors.profile = 'El perfil debe tener al menos 20 caracteres.'
      }
    }

    if (activeTab === 'programs') {
      if (!formValues.areaId) {
        nextErrors.areaId = 'Selecciona el área a la que pertenece el programa.'
      }
      if (formValues.description.trim().length < 20) {
        nextErrors.description = 'La descripción debe tener al menos 20 caracteres.'
      }
      if (formValues.url && !URL.canParse(formValues.url)) {
        nextErrors.url = 'Ingresa una URL válida o deja el campo vacío.'
      }
    }

    if (activeTab === 'tests') {
      if (!formValues.version.trim()) {
        nextErrors.version = 'Ingresa una versión.'
      }
      const questionCount = Number(formValues.questionCount)
      if (!Number.isInteger(questionCount) || questionCount <= 0) {
        nextErrors.questionCount = 'Ingresa una cantidad entera mayor que cero.'
      }
      const durationMinutes = Number(formValues.durationMinutes)
      if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        nextErrors.durationMinutes = 'Ingresa una duración entera mayor que cero.'
      }
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!catalogs || !validateForm()) {
      return
    }

    const id = formMode === 'edit' ? formValues.id : `${activeTab}-${crypto.randomUUID()}`

    if (activeTab === 'areas') {
      const previous = catalogs.areas.find((item) => item.id === id)
      const nextItem: AdminAreaCatalogItem = {
        id,
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        profile: formValues.profile.trim(),
        active: previous?.active ?? true,
      }
      setCatalogs({
        ...catalogs,
        areas:
          formMode === 'edit'
            ? catalogs.areas.map((item) => (item.id === id ? nextItem : item))
            : [...catalogs.areas, nextItem],
      })
    } else if (activeTab === 'programs') {
      const previous = catalogs.programs.find((item) => item.id === id)
      const nextItem: AdminProgramCatalogItem = {
        id,
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        areaId: formValues.areaId,
        url: formValues.url.trim() || undefined,
        active: previous?.active ?? true,
      }
      setCatalogs({
        ...catalogs,
        programs:
          formMode === 'edit'
            ? catalogs.programs.map((item) => (item.id === id ? nextItem : item))
            : [...catalogs.programs, nextItem],
      })
    } else {
      const previous = catalogs.tests.find((item) => item.id === id)
      const nextItem: AdminTestCatalogItem = {
        id,
        name: formValues.name.trim(),
        version: formValues.version.trim(),
        questionCount: Number(formValues.questionCount),
        durationMinutes: Number(formValues.durationMinutes),
        active: previous?.active ?? true,
      }
      setCatalogs({
        ...catalogs,
        tests:
          formMode === 'edit'
            ? catalogs.tests.map((item) => (item.id === id ? nextItem : item))
            : [...catalogs.tests, nextItem],
      })
    }

    setFormMode(null)
    setFormValues(EMPTY_FORM)
    setEditingPachoPath(null)
    setStatus(null)
  }

  function toggleActive(id: string, currentlyActive: boolean) {
    if (!catalogs) {
      return
    }

    const action = currentlyActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Deseas ${action} este registro? El cambio se aplica al servidor al guardar.`)) {
      return
    }

    if (activeTab === 'areas') {
      setCatalogs({
        ...catalogs,
        areas: catalogs.areas.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      })
    } else if (activeTab === 'programs') {
      setCatalogs({
        ...catalogs,
        programs: catalogs.programs.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      })
    } else {
      setCatalogs({
        ...catalogs,
        tests: catalogs.tests.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      })
    }
    setStatus(null)
  }

  async function saveCatalogChanges() {
    if (!catalogs || !savedCatalogs) {
      return
    }

    try {
      setIsSaving(true)
      setStatus(null)
      const response = await adminService.saveCatalogs(catalogs, savedCatalogs)
      const saved = cloneCatalogs(response.data)
      setSavedCatalogs(saved)
      setCatalogs(cloneCatalogs(saved))
      setStatus({
        tone: 'success',
        message: 'Cambios guardados y enviados al servidor.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible guardar la configuración.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePachoUpload(areaId: string, file: File) {
    try {
      setUploadingAreaId(areaId)
      setStatus(null)
      const response = await adminService.uploadPachoImage(areaId, file)
      setEditingPachoPath(response.data.pachoPath)
      setCatalogs((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          areas: prev.areas.map((a) =>
            a.id === areaId ? { ...a, pachoPath: response.data.pachoPath } : a
          ),
        }
      })
      setStatus({
        tone: 'success',
        message: 'Imagen de Pacho actualizada correctamente.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible subir la imagen.',
      })
    } finally {
      setUploadingAreaId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function triggerPachoUpload() {
    if (!fileInputRef.current || !formValues.id) return
    fileInputRef.current.dataset.areaId = formValues.id
    fileInputRef.current.click()
  }

  if (loadState === 'loading') {
    return <div className="loading-state">Cargando configuración...</div>
  }

  if (loadState === 'error' || !catalogs || !savedCatalogs) {
    return (
      <section className="seccion-administracion admin-error-state" role="alert">
        <h2>No fue posible cargar la configuración</h2>
        <p>El resto del panel sigue disponible. Recarga la página para reintentar este módulo.</p>
      </section>
    )
  }

  return (
    <section className="seccion-administracion">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          const areaId = e.target.dataset.areaId
          if (file && areaId) {
            void handlePachoUpload(areaId, file)
          }
        }}
      />
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Administrador · Configuración</span>
          <h2>Área - Programas - Prueba</h2>
          <p>
            Áreas y programas se gestionan contra el backend. La pestaña “Prueba” se mantiene como
            propuesta local porque el backend modela intentos, no definiciones de prueba.
          </p>
        </div>
      </div>

      <div className="admin-catalog-tabs" role="tablist" aria-label="Catálogos administrativos">
        {(Object.keys(TAB_LABELS) as CatalogTab[]).map((tab) => (
          <button
            key={tab}
            id={`catalog-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="catalog-panel"
            className={activeTab === tab ? 'admin-catalog-tabs__active' : undefined}
            onClick={() => {
              setActiveTab(tab)
              setFormMode(null)
              setFormErrors({})
              setSearchQuery('')
            }}
          >
            {TAB_LABELS[tab]}
            <span>{catalogs[tab].length}</span>
          </button>
        ))}
      </div>

      <div
        id="catalog-panel"
        role="tabpanel"
        aria-labelledby={`catalog-tab-${activeTab}`}
        className="admin-catalog-panel"
      >
        <div className="admin-catalog-panel__toolbar">
          <div>
            <strong>{TAB_LABELS[activeTab]}</strong>
            <span>Crear, editar y cambiar el estado de los registros del borrador.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Buscar ${activeTab === 'areas' ? 'área' : activeTab === 'programs' ? 'programa' : 'prueba'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                width: '200px',
              }}
            />
            <button type="button" onClick={openCreateForm}>
              Crear {activeTab === 'areas' ? 'área' : activeTab === 'programs' ? 'programa' : 'prueba'}
            </button>
          </div>
        </div>

        {formMode ? (
          <form className="admin-catalog-form" onSubmit={submitForm} noValidate>
            <div className="admin-catalog-form__heading">
              <strong>{formMode === 'create' ? 'Nuevo registro' : 'Editar registro'}</strong>
              <button type="button" onClick={() => setFormMode(null)} aria-label="Cerrar formulario">
                ×
              </button>
            </div>
            <div className="admin-catalog-form__grid">
              <label htmlFor="catalog-name">
                Nombre
                <input
                  id="catalog-name"
                  value={formValues.name}
                  aria-invalid={Boolean(formErrors.name)}
                  onChange={(event) => updateForm('name', event.target.value)}
                />
                {formErrors.name ? <small className="form-field__error">{formErrors.name}</small> : null}
              </label>

              {activeTab === 'areas' ? (
                <>
                  <label htmlFor="catalog-description" className="admin-catalog-form__full">
                    Descripción del área
                    <textarea
                      id="catalog-description"
                      value={formValues.description}
                      aria-invalid={Boolean(formErrors.description)}
                      onChange={(event) => updateForm('description', event.target.value)}
                    />
                    {formErrors.description ? <small className="form-field__error">{formErrors.description}</small> : null}
                  </label>
                  <label htmlFor="catalog-profile" className="admin-catalog-form__full">
                    Perfil predominante
                    <textarea
                      id="catalog-profile"
                      value={formValues.profile}
                      aria-invalid={Boolean(formErrors.profile)}
                      onChange={(event) => updateForm('profile', event.target.value)}
                    />
                    {formErrors.profile ? <small className="form-field__error">{formErrors.profile}</small> : null}
                  </label>
                  {formMode === 'edit' ? (
                    <div className="admin-catalog-form__full admin-catalog-form__pacho">
                      <strong>Imagen de Pacho</strong>
                      {editingPachoPath ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? 'http://localhost:8088'}/uploads/pacho/${editingPachoPath}`}
                          alt={`Pacho de ${formValues.name}`}
                          className="admin-catalog-form__pacho-img"
                        />
                      ) : (
                        <p className="admin-catalog-form__pacho-empty">Sin imagen asignada</p>
                      )}
                      <button
                        type="button"
                        onClick={triggerPachoUpload}
                        disabled={uploadingAreaId === formValues.id}
                      >
                        {uploadingAreaId === formValues.id ? 'Subiendo...' : editingPachoPath ? 'Cambiar imagen' : 'Subir imagen'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}

              {activeTab === 'programs' ? (
                <>
                  <label htmlFor="catalog-area">
                    Área
                    <select
                      id="catalog-area"
                      value={formValues.areaId}
                      aria-invalid={Boolean(formErrors.areaId)}
                      onChange={(event) => updateForm('areaId', event.target.value)}
                    >
                      <option value="">Selecciona un área</option>
                      {catalogs.areas.filter((area) => area.active).map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                    {formErrors.areaId ? <small className="form-field__error">{formErrors.areaId}</small> : null}
                  </label>
                  <label htmlFor="catalog-url">
                    URL informativa (opcional)
                    <input
                      id="catalog-url"
                      type="url"
                      value={formValues.url}
                      aria-invalid={Boolean(formErrors.url)}
                      onChange={(event) => updateForm('url', event.target.value)}
                    />
                    {formErrors.url ? <small className="form-field__error">{formErrors.url}</small> : null}
                  </label>
                  <label htmlFor="catalog-description" className="admin-catalog-form__full">
                    Descripción del programa
                    <textarea
                      id="catalog-description"
                      value={formValues.description}
                      aria-invalid={Boolean(formErrors.description)}
                      onChange={(event) => updateForm('description', event.target.value)}
                    />
                    {formErrors.description ? <small className="form-field__error">{formErrors.description}</small> : null}
                  </label>
                </>
              ) : null}

              {activeTab === 'tests' ? (
                <>
                  <label htmlFor="catalog-version">
                    Versión
                    <input
                      id="catalog-version"
                      value={formValues.version}
                      aria-invalid={Boolean(formErrors.version)}
                      onChange={(event) => updateForm('version', event.target.value)}
                    />
                    {formErrors.version ? <small className="form-field__error">{formErrors.version}</small> : null}
                  </label>
                  <label htmlFor="catalog-question-count">
                    Número de preguntas
                    <input
                      id="catalog-question-count"
                      type="number"
                      min="1"
                      value={formValues.questionCount}
                      aria-invalid={Boolean(formErrors.questionCount)}
                      onChange={(event) => updateForm('questionCount', event.target.value)}
                    />
                    {formErrors.questionCount ? <small className="form-field__error">{formErrors.questionCount}</small> : null}
                  </label>
                  <label htmlFor="catalog-duration">
                    Duración estimada (minutos)
                    <input
                      id="catalog-duration"
                      type="number"
                      min="1"
                      value={formValues.durationMinutes}
                      aria-invalid={Boolean(formErrors.durationMinutes)}
                      onChange={(event) => updateForm('durationMinutes', event.target.value)}
                    />
                    {formErrors.durationMinutes ? <small className="form-field__error">{formErrors.durationMinutes}</small> : null}
                  </label>
                </>
              ) : null}
            </div>
            <div className="admin-catalog-form__actions">
              <button type="button" onClick={() => setFormMode(null)}>Cancelar</button>
              <button type="submit">{formMode === 'create' ? 'Agregar al borrador' : 'Aplicar al borrador'}</button>
            </div>
          </form>
        ) : null}

        {activeItems.length > 0 ? (
          <div className="admin-catalog-list">
            {searchQuery.trim() && activeItems.length < (catalogs?.[activeTab]?.length ?? 0) ? (
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Mostrando {activeItems.length} de {catalogs?.[activeTab]?.length ?? 0} registros
              </p>
            ) : null}
            {activeItems.map((item) => {
              const area = activeTab === 'areas' ? (item as AdminAreaCatalogItem) : null
              const program = activeTab === 'programs' ? (item as AdminProgramCatalogItem) : null
              const test = activeTab === 'tests' ? (item as AdminTestCatalogItem) : null
              return (
                <article key={item.id} className={!item.active ? 'admin-catalog-list__inactive' : undefined}>
                  <div>
                    <span>{item.active ? 'Activo' : 'Inactivo'}</span>
                    <strong>{item.name}</strong>
                    {area ? (
                      <p><b>Perfil:</b> {area.profile}</p>
                    ) : program ? (
                      <p>
                        <b>Área:</b>{' '}
                        {catalogs.areas.find((catalogArea) => catalogArea.id === program.areaId)?.name ?? 'Área no disponible'}
                      </p>
                    ) : test ? (
                      <p>{test.version} · {test.questionCount} preguntas · {test.durationMinutes} min</p>
                    ) : null}
                  </div>
                  <div className="admin-catalog-list__actions">
                    <button type="button" onClick={() => openEditForm(item)}>Editar</button>
                    <button type="button" onClick={() => toggleActive(item.id, item.active)}>
                      {item.active ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            {searchQuery.trim()
              ? `No se encontraron resultados para "${searchQuery.trim()}".`
              : 'No hay registros en este catálogo.'}
          </div>
        )}
      </div>

      <div className="admin-save-bar">
        <div>
          <strong>{hasPendingChanges ? 'Cambios pendientes' : 'Sin cambios pendientes'}</strong>
          <span>Los cambios del borrador requieren guardado explícito.</span>
        </div>
        <div className="admin-save-bar__actions">
          <button
            type="button"
            onClick={() => {
              setCatalogs(cloneCatalogs(savedCatalogs))
              setFormMode(null)
              setStatus(null)
            }}
            disabled={!hasPendingChanges || isSaving}
          >
            Descartar
          </button>
          <button
            type="button"
            className="boton-principal"
            onClick={() => void saveCatalogChanges()}
            disabled={!hasPendingChanges || isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {status ? (
        <p className={`admin-feedback admin-feedback--${status.tone}`} role={status.tone === 'error' ? 'alert' : 'status'}>
          {status.message}
        </p>
      ) : null}
    </section>
  )
}
