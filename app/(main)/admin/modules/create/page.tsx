import { ModuleWizard } from '@/components/admin/ModuleWizard'

export default function CreateModulePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        background: '#0a0a0a',
        borderBottom: '2px solid #333',
        padding: '24px 40px'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#0f0'
          }}>
            🚀 Create New Module
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#999'
          }}>
            Use the wizard to create a professional course module in minutes
          </p>
        </div>
      </div>

      {/* Wizard */}
      <ModuleWizard />
    </div>
  )
}
