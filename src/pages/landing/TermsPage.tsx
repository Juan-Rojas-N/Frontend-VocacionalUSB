import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../constants'

const TERMS_SECTIONS = [
  {
    title: '1. Identificación y objeto',
    content: (
      <>
        <p>
          Los presentes Términos y Condiciones regulan el acceso, registro y utilización del
          Sistema de Orientación Vocacional, una aplicación web desarrollada para apoyar a
          aspirantes y estudiantes de la Universidad de San Buenaventura en sus procesos de
          exploración y toma de decisiones académicas.
        </p>
        <p>
          La plataforma permite diligenciar una prueba psicotécnica digital orientada a identificar
          intereses, habilidades y aptitudes, a partir de cuyos resultados el sistema genera
          recomendaciones académicas personalizadas.
        </p>
        <p>
          El sistema constituye una herramienta de orientación y apoyo a la toma de decisiones y no
          reemplaza los procesos de asesoría, acompañamiento u orientación profesional ofrecidos
          por la Universidad.
        </p>
      </>
    ),
  },
  {
    title: '2. Aceptación de los términos',
    content: (
      <>
        <p>
          El acceso y utilización de la plataforma implican la lectura, comprensión y aceptación de
          estos Términos y Condiciones.
        </p>
        <p>
          En caso de que el usuario no esté de acuerdo con alguno de los términos establecidos,
          deberá abstenerse de utilizar la plataforma.
        </p>
        <p>
          Cuando corresponda, el usuario deberá manifestar expresamente su aceptación antes de
          iniciar el proceso de registro o diligenciamiento de la prueba psicotécnica.
        </p>
      </>
    ),
  },
  {
    title: '3. Usuarios de la plataforma',
    content: (
      <>
        <p>La plataforma está dirigida principalmente a:</p>
        <ul>
          <li>Aspirantes interesados en conocer opciones académicas acordes con sus intereses y aptitudes.</li>
          <li>Estudiantes de la Universidad de San Buenaventura que deseen complementar su proceso de orientación académica.</li>
          <li>Personal autorizado de la institución encargado de procesos de orientación, acompañamiento, análisis académico o administración del sistema.</li>
        </ul>
        <p>
          El acceso a determinadas funcionalidades podrá estar condicionado al tipo de usuario y a
          los permisos asignados dentro de la plataforma.
        </p>
      </>
    ),
  },
  {
    title: '4. Registro y creación de cuenta',
    content: (
      <>
        <p>
          Para utilizar determinadas funcionalidades, el usuario podrá requerir la creación de una
          cuenta proporcionando información veraz, completa y actualizada.
        </p>
        <p>El usuario se compromete a:</p>
        <ol>
          <li>Proporcionar información correcta durante el registro.</li>
          <li>Mantener actualizada la información suministrada.</li>
          <li>Proteger sus credenciales de acceso.</li>
          <li>No compartir su usuario o contraseña con terceros.</li>
          <li>Informar a la institución sobre cualquier uso no autorizado de su cuenta.</li>
          <li>No utilizar cuentas pertenecientes a otros usuarios.</li>
        </ol>
        <p>
          La Universidad podrá restringir o suspender cuentas cuando detecte actividades que puedan
          comprometer la seguridad, integridad o funcionamiento de la plataforma.
        </p>
      </>
    ),
  },
  {
    title: '5. Uso de la prueba psicotécnica',
    content: (
      <>
        <p>
          La plataforma incorpora una prueba digital destinada a identificar características
          relacionadas con los intereses, habilidades y aptitudes académicas del usuario.
        </p>
        <p>
          El usuario deberá responder las preguntas de manera individual, voluntaria y procurando
          proporcionar información que represente adecuadamente sus intereses y preferencias.
        </p>
        <p>
          Los resultados obtenidos dependen de las respuestas suministradas por el usuario y de los
          criterios, modelos o reglas implementados en el sistema.
        </p>
        <p>
          La prueba tiene una finalidad orientativa, por lo que sus resultados no deben interpretarse
          como un diagnóstico psicológico, clínico o profesional.
        </p>
      </>
    ),
  },
  {
    title: '6. Naturaleza de las recomendaciones',
    content: (
      <>
        <p>
          Las recomendaciones generadas por el sistema tienen carácter informativo y orientativo.
        </p>
        <p>
          La plataforma puede presentar programas académicos o áreas de formación que guarden
          relación con los resultados obtenidos en la prueba. Sin embargo, estas recomendaciones:
        </p>
        <ul>
          <li>No constituyen una decisión de admisión.</li>
          <li>No garantizan el ingreso a un programa académico.</li>
          <li>No constituyen una evaluación definitiva de las capacidades del usuario.</li>
          <li>No determinan de manera obligatoria la elección profesional o académica.</li>
          <li>No sustituyen la asesoría de profesionales de orientación vocacional o académica.</li>
        </ul>
        <p>
          La decisión final respecto de la elección de un programa académico corresponde
          exclusivamente al usuario, quien podrá solicitar acompañamiento institucional cuando lo
          considere necesario.
        </p>
      </>
    ),
  },
  {
    title: '7. Información suministrada por el usuario',
    content: (
      <>
        <p>
          Durante el uso de la plataforma podrán recopilarse datos necesarios para el funcionamiento
          del sistema, incluyendo, según corresponda:
        </p>
        <ul>
          <li>Información de identificación.</li>
          <li>Información de contacto.</li>
          <li>Información académica.</li>
          <li>Respuestas proporcionadas durante la prueba.</li>
          <li>Resultados obtenidos.</li>
          <li>Información relacionada con programas académicos de interés.</li>
          <li>Información técnica necesaria para garantizar el funcionamiento y la seguridad de la plataforma.</li>
        </ul>
        <p>
          La información será utilizada de acuerdo con las finalidades informadas al usuario y con la
          normativa aplicable en materia de protección de datos personales.
        </p>
      </>
    ),
  },
  {
    title: '8. Tratamiento de datos personales',
    content: (
      <>
        <p>
          El tratamiento de los datos personales recopilados mediante la plataforma se realizará de
          conformidad con la legislación colombiana aplicable en materia de protección de datos
          personales y con las políticas institucionales de tratamiento de información de la
          Universidad.
        </p>
        <p>Los datos podrán ser utilizados para:</p>
        <ul>
          <li>Permitir el funcionamiento de la plataforma.</li>
          <li>Procesar las respuestas de la prueba psicotécnica.</li>
          <li>Generar recomendaciones académicas.</li>
          <li>Realizar análisis estadísticos y académicos.</li>
          <li>Mejorar el funcionamiento del sistema.</li>
          <li>Generar información para procesos institucionales de orientación y acompañamiento.</li>
          <li>Elaborar indicadores o reportes institucionales, preferiblemente mediante información agregada o anonimizada cuando corresponda.</li>
        </ul>
        <p>
          La utilización de la información para finalidades adicionales deberá estar sujeta a las
          autorizaciones y condiciones legalmente requeridas.
        </p>
      </>
    ),
  },
  {
    title: '9. Confidencialidad y seguridad',
    content: (
      <>
        <p>
          La Universidad implementará medidas técnicas y organizativas razonables destinadas a
          proteger la información almacenada y procesada por la plataforma frente a accesos no
          autorizados, pérdida, alteración, divulgación o uso indebido.
        </p>
        <p>
          La solución utiliza una arquitectura cliente-servidor con comunicación mediante API REST,
          un backend desarrollado con Kotlin y Spring Boot, un frontend desarrollado con React y una
          base de datos MySQL.
        </p>
        <p>
          El acceso a las funcionalidades administrativas estará condicionado a mecanismos de
          autenticación y autorización de acuerdo con los roles definidos en el sistema.
        </p>
        <p>
          No obstante, el usuario reconoce que ningún sistema informático conectado a una red puede
          garantizar un nivel de seguridad absolutamente invulnerable.
        </p>
      </>
    ),
  },
  {
    title: '10. Uso adecuado de la plataforma',
    content: (
      <>
        <p>
          El usuario se compromete a utilizar el sistema exclusivamente para los fines para los
          cuales fue desarrollado.
        </p>
        <p>Está prohibido:</p>
        <ul>
          <li>Acceder sin autorización a información de otros usuarios.</li>
          <li>Intentar vulnerar los mecanismos de seguridad.</li>
          <li>Alterar, modificar o eliminar información sin autorización.</li>
          <li>Introducir código malicioso, virus o cualquier elemento que pueda afectar la plataforma.</li>
          <li>Realizar ataques de denegación de servicio o actividades similares.</li>
          <li>Utilizar herramientas automatizadas para extraer información sin autorización.</li>
          <li>Suplantar la identidad de otros usuarios.</li>
          <li>Utilizar la información obtenida mediante la plataforma para fines no autorizados.</li>
          <li>Realizar actividades que afecten la disponibilidad, integridad o confidencialidad del sistema.</li>
        </ul>
        <p>
          El incumplimiento podrá ocasionar la suspensión del acceso y, cuando corresponda, la
          aplicación de las medidas administrativas o legales pertinentes.
        </p>
      </>
    ),
  },
  {
    title: '11. Disponibilidad del servicio',
    content: (
      <>
        <p>
          La Universidad procurará mantener disponible la plataforma de manera continua. Sin embargo,
          pueden presentarse interrupciones derivadas de:
        </p>
        <ul>
          <li>Mantenimiento preventivo o correctivo.</li>
          <li>Actualizaciones del sistema.</li>
          <li>Fallas de infraestructura.</li>
          <li>Problemas de conectividad.</li>
          <li>Incidentes de seguridad.</li>
          <li>Situaciones de fuerza mayor o caso fortuito.</li>
          <li>Fallas de servicios tecnológicos de terceros.</li>
        </ul>
        <p>
          La Universidad podrá realizar modificaciones, actualizaciones o mejoras a la plataforma
          cuando sean necesarias para garantizar su funcionamiento, seguridad o evolución.
        </p>
      </>
    ),
  },
  {
    title: '12. Propiedad intelectual',
    content: (
      <>
        <p>
          Los elementos que conforman la plataforma, incluyendo su código fuente, estructura, diseño,
          interfaces, documentación, bases de datos, componentes gráficos y demás elementos
          desarrollados específicamente para el proyecto, estarán sujetos al régimen de propiedad
          intelectual aplicable y a las disposiciones institucionales correspondientes.
        </p>
        <p>
          Los nombres, logotipos, signos distintivos y demás elementos pertenecientes a la
          Universidad de San Buenaventura no podrán utilizarse sin la autorización correspondiente.
        </p>
        <p>
          El usuario no adquiere derechos de propiedad sobre la plataforma por el simple hecho de
          utilizarla.
        </p>
      </>
    ),
  },
  {
    title: '13. Limitación de responsabilidad',
    content: (
      <>
        <p>
          La plataforma ha sido desarrollada como una herramienta de apoyo para la orientación
          vocacional y académica.
        </p>
        <p>
          En consecuencia, la Universidad no garantiza que las recomendaciones generadas por el
          sistema correspondan necesariamente con la decisión académica o profesional que finalmente
          resulte más conveniente para cada usuario.
        </p>
        <p>
          Las recomendaciones se generan a partir de la información suministrada y de los mecanismos
          de procesamiento implementados en el sistema.
        </p>
        <p>
          La Universidad no será responsable por decisiones académicas, profesionales o personales
          adoptadas exclusivamente con base en las recomendaciones proporcionadas por la plataforma.
        </p>
      </>
    ),
  },
  {
    title: '14. Menores de edad',
    content: (
      <>
        <p>
          En caso de que la plataforma sea utilizada por personas menores de edad, el tratamiento de
          sus datos personales deberá realizarse de conformidad con las disposiciones legales
          aplicables y las políticas institucionales correspondientes.
        </p>
        <p>
          Cuando sea necesario, se deberán obtener las autorizaciones requeridas de los
          representantes legales o responsables del menor.
        </p>
      </>
    ),
  },
  {
    title: '15. Modificación de los términos',
    content: (
      <>
        <p>
          La Universidad podrá modificar estos Términos y Condiciones cuando sea necesario debido a
          cambios funcionales, tecnológicos, institucionales o normativos.
        </p>
        <p>
          Las modificaciones serán comunicadas mediante los mecanismos disponibles en la plataforma y
          entrarán en vigencia a partir de la fecha indicada en la nueva versión.
        </p>
        <p>
          El uso continuado del sistema después de la entrada en vigencia de las modificaciones
          implicará la aceptación de los nuevos términos, cuando legalmente corresponda.
        </p>
      </>
    ),
  },
  {
    title: '16. Terminación o suspensión del acceso',
    content: (
      <>
        <p>La Universidad podrá suspender temporal o definitivamente el acceso de un usuario cuando:</p>
        <ul>
          <li>Incumpla estos Términos y Condiciones.</li>
          <li>Utilice la plataforma de manera fraudulenta o indebida.</li>
          <li>Intente comprometer la seguridad del sistema.</li>
          <li>Proporcione información falsa de manera deliberada.</li>
          <li>Exista una obligación legal o institucional que así lo requiera.</li>
        </ul>
        <p>
          Cuando sea procedente, el usuario podrá solicitar la revisión de la medida conforme a los
          mecanismos institucionales establecidos.
        </p>
      </>
    ),
  },
  {
    title: '17. Derechos del usuario',
    content: (
      <>
        <p>
          De acuerdo con la normativa colombiana aplicable, el titular de los datos personales podrá
          ejercer los derechos que le correspondan respecto de su información, incluyendo, según
          aplique:
        </p>
        <ul>
          <li>Conocer los datos personales objeto de tratamiento.</li>
          <li>Solicitar la actualización o rectificación de información.</li>
          <li>Solicitar información sobre el tratamiento realizado.</li>
          <li>Presentar consultas o reclamos.</li>
          <li>Solicitar la supresión de datos cuando sea legalmente procedente.</li>
          <li>Revocar la autorización cuando corresponda.</li>
          <li>Ejercer los demás derechos reconocidos por la legislación aplicable.</li>
        </ul>
        <p>
          Las solicitudes deberán presentarse a través de los canales institucionales establecidos
          por la Universidad para la atención de asuntos relacionados con la protección de datos
          personales.
        </p>
      </>
    ),
  },
  {
    title: '18. Canales de contacto',
    content: (
      <ul>
        <li>Universidad: Universidad de San Buenaventura sede Bogotá</li>
        <li>Sistema: Sistema de Orientación Vocacional</li>
        <li>Correo electrónico: psi.decano@usbbog.edu.co</li>
        <li>Área responsable: Decanatura de psicología</li>
        <li>Sitio web: https://www.usbbog.edu.co</li>
      </ul>
    ),
  },
  {
    title: '19. Legislación aplicable',
    content: (
      <>
        <p>
          Los presentes Términos y Condiciones se regirán por las leyes y disposiciones aplicables de
          la República de Colombia.
        </p>
        <p>
          Cualquier situación no contemplada expresamente en estos términos será resuelta de acuerdo
          con la legislación vigente y las políticas, reglamentos y disposiciones institucionales
          aplicables.
        </p>
      </>
    ),
  },
  {
    title: '20. Aceptación',
    content: (
      <>
        <p>
          Al seleccionar la opción &ldquo;Acepto los términos y condiciones&rdquo;, registrarse o
          utilizar las funcionalidades de la plataforma cuando dicha aceptación sea requerida, el
          usuario manifiesta que:
        </p>
        <ul>
          <li>Ha leído y comprendido los presentes Términos y Condiciones.</li>
          <li>Acepta las condiciones establecidas para el uso de la plataforma.</li>
          <li>Comprende que las recomendaciones tienen carácter orientativo.</li>
          <li>Se compromete a utilizar responsablemente el sistema.</li>
          <li>
            Reconoce las condiciones relacionadas con el tratamiento de sus datos personales, de
            acuerdo con las autorizaciones y avisos de privacidad correspondientes.
          </li>
        </ul>
      </>
    ),
  },
]

export function TermsPage() {
  return (
    <div className="legal-shell">
      <section className="legal-hero">
        <div className="legal-hero__inner">
          <span className="legal-hero__tag">SOVA-USB</span>
          <h1>Términos y Condiciones de Uso</h1>
          <p>Sistema de Orientación Vocacional y Académica de la Universidad de San Buenaventura</p>
          <p className="legal-hero__meta">Fecha: 17/08/2026 — Versión: 1.0</p>
        </div>
      </section>

      <section className="legal-content" aria-label="Texto de términos y condiciones">
        {TERMS_SECTIONS.map((section) => (
          <article key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.content}
          </article>
        ))}
      </section>

      <section className="legal-actions">
        <Link to={APP_ROUTES.register} className="legal-actions__cta">
          Volver al registro
        </Link>
      </section>
    </div>
  )
}
