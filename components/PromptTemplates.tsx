import { PROMPT_TEMPLATES, UI_CONSTANTS } from '@lib/constants';

interface PromptTemplatesProps {
  onSelectTemplate: (template: string) => void;
  disabled?: boolean;
}

export default function PromptTemplates({ onSelectTemplate, disabled = false }: PromptTemplatesProps) {

  return (
    <div className="bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div 
          data-testid="templates-grid"
          className="grid grid-cols-2 gap-3"
        >
          {PROMPT_TEMPLATES.map((template, index) => (
            <button
              key={index}
              data-testid={`template-button-${index}`}
              onClick={() => !disabled && onSelectTemplate(template.replace(/\n/g, " "))}
              disabled={disabled}
              className={`p-4 bg-gray-50 border border-gray-200 rounded-lg text-left text-sm text-gray-700 transition-all duration-200 ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 active:scale-95"
              }`}
            >
              <div className="whitespace-pre-line">
                {template}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 