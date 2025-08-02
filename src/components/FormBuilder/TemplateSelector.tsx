import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Briefcase, MessageSquare, Mail, ShoppingCart } from 'lucide-react';
import { FormTemplate } from '@/lib/whatsapp';
import { formTemplates, getTemplatesByCategory } from '@/data/formTemplates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: FormTemplate) => void;
}

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) => {
  const categoriesWithTemplates = getTemplatesByCategory();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return <FileText className="h-5 w-5" />;
      case 'Events': return <Users className="h-5 w-5" />;
      case 'HR': return <Briefcase className="h-5 w-5" />;
      case 'Feedback': return <MessageSquare className="h-5 w-5" />;
      case 'Marketing': return <Mail className="h-5 w-5" />;
      case 'E-commerce': return <ShoppingCart className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const handleSelectTemplate = (template: FormTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template or create a form from scratch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Start from Scratch Option */}
          <div>
            <h3 className="text-sm font-medium mb-3">Custom</h3>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClose()}>
              <CardHeader>
                <CardTitle className="text-base">Start from Scratch</CardTitle>
                <CardDescription>
                  Create a completely custom form with your own fields
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Template Categories */}
          {categoriesWithTemplates.map(({ category, templates }) => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-3">
                {getCategoryIcon(category)}
                <h3 className="text-sm font-medium">{category}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {template.fields.length} fields
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;