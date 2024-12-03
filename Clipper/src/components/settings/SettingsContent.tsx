import { GeneralSettings } from './SettingsGeneral';
import { TemplateSettings } from './SettingsTemplate';

export const SettingsContent = ({ activeTab }: { activeTab: string }) => {
  return (
    <div>
      {activeTab === 'General' && <GeneralSettings />}
      {activeTab === 'Template' && <TemplateSettings />}
    </div>
  );
};
