//the import without HTML naming will be used when the functionality of converting the template from docx is ready
import TemplateManagement from '../components/TemplateManagement';

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="space-y-8">
        {/* Other settings sections */}

        <div className="bg-white rounded-lg shadow p-6">
          <TemplateManagement />
        </div>
      </div>
    </div>
  );
}
