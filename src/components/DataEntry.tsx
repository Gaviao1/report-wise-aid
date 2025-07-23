import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import { CSVImporter } from './CSVImporter';
import { DiagrammedMaterial, ReportData } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

interface DataEntryProps {
  onSaveReport: (data: ReportData) => void;
}

interface DataEntryState {
  showCSVImporter: boolean;
}

export function DataEntry({ onSaveReport }: DataEntryProps) {
  const { toast } = useToast();
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [period, setPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Material Production
  const [ebooks, setEbooks] = useState(0);
  const [printedBooks, setPrintedBooks] = useState(0);
  
  // Visual Identity
  const [visualIdentities, setVisualIdentities] = useState(0);
  
  // Diagrammed Materials
  const [diagrammedMaterials, setDiagrammedMaterials] = useState<DiagrammedMaterial[]>([
    { platform: 'AVACEAD', program: '', quantity: 0 }
  ]);

  const addDiagrammedMaterial = () => {
    setDiagrammedMaterials([
      ...diagrammedMaterials,
      { platform: 'AVACEAD', program: '', quantity: 0 }
    ]);
  };

  const removeDiagrammedMaterial = (index: number) => {
    setDiagrammedMaterials(diagrammedMaterials.filter((_, i) => i !== index));
  };

  const updateDiagrammedMaterial = (index: number, field: keyof DiagrammedMaterial, value: any) => {
    const updated = [...diagrammedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setDiagrammedMaterials(updated);
  };

  const handleSave = () => {
    if (!period || !startDate || !endDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha período e datas.",
        variant: "destructive"
      });
      return;
    }

    const reportData: ReportData = {
      id: Date.now().toString(),
      period,
      startDate,
      endDate,
      materialProduction: {
        ebooks,
        printedBooks
      },
      visualIdentity: {
        created: visualIdentities
      },
      diagrammedMaterials: diagrammedMaterials.filter(item => item.program && item.quantity > 0),
      createdAt: new Date().toISOString()
    };

    onSaveReport(reportData);
    
    toast({
      title: "Relatório salvo",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-to-r from-institutional to-institutional-light text-institutional-foreground">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Entrada de Dados - Relatório de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Período e Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period">Período de Referência</Label>
              <Input
                id="period"
                placeholder="Ex: Janeiro/2025"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Produção de Materiais Didáticos */}
          <div>
            <h3 className="text-lg font-semibold text-institutional mb-4">
              Produção de Materiais Didáticos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ebooks">E-books Finalizados</Label>
                <Input
                  id="ebooks"
                  type="number"
                  min="0"
                  value={ebooks}
                  onChange={(e) => setEbooks(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="printedBooks">Livros Impressos</Label>
                <Input
                  id="printedBooks"
                  type="number"
                  min="0"
                  value={printedBooks}
                  onChange={(e) => setPrintedBooks(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Criação de Identidade Visual */}
          <div>
            <h3 className="text-lg font-semibold text-institutional mb-4">
              Criação de Identidade Visual
            </h3>
            <div className="max-w-md">
              <Label htmlFor="visualIdentities">Identidades Visuais Criadas</Label>
              <Input
                id="visualIdentities"
                type="number"
                min="0"
                value={visualIdentities}
                onChange={(e) => setVisualIdentities(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Materiais Diagramados */}
          <div>
            <h3 className="text-lg font-semibold text-institutional mb-4">
              Materiais Diagramados
            </h3>
            <div className="space-y-4">
              {diagrammedMaterials.map((material, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Plataforma</Label>
                      <Select
                        value={material.platform}
                        onValueChange={(value: 'AVACEAD' | 'AVAMEC') =>
                          updateDiagrammedMaterial(index, 'platform', value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AVACEAD">AVACEAD</SelectItem>
                          <SelectItem value="AVAMEC">AVAMEC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Programa/Projeto</Label>
                      <Input
                        placeholder="Ex: UAB, Formação Continuada"
                        value={material.program}
                        onChange={(e) =>
                          updateDiagrammedMaterial(index, 'program', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.quantity}
                        onChange={(e) =>
                          updateDiagrammedMaterial(index, 'quantity', Number(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      {index === diagrammedMaterials.length - 1 && (
                        <Button
                          type="button"
                          onClick={addDiagrammedMaterial}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      {diagrammedMaterials.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeDiagrammedMaterial(index)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button onClick={handleSave} className="bg-institutional hover:bg-institutional-light">
              <FileText className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCSVImporter(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          </div>

          {showCSVImporter && (
            <div className="mt-6">
              <CSVImporter 
                onImportData={(data) => {
                  onSaveReport(data);
                  setShowCSVImporter(false);
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => setShowCSVImporter(false)}
                className="mt-4"
              >
                Cancelar Importação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}