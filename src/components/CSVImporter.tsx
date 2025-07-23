import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { ReportData, DiagrammedMaterial } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

interface CSVImporterProps {
  onImportData: (data: ReportData) => void;
}

interface CSVRow {
  periodo: string;
  dataInicio: string;
  dataFim: string;
  ebooks: string;
  livrosImpressos: string;
  identidadesVisuais: string;
  plataforma: string;
  programa: string;
  quantidade: string;
}

export function CSVImporter({ onImportData }: CSVImporterProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          processCSVData(results.data as CSVRow[]);
        } catch (err) {
          setError('Erro ao processar o arquivo CSV. Verifique o formato dos dados.');
          console.error('Erro no processamento:', err);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setError(`Erro ao ler o arquivo: ${error.message}`);
        setIsProcessing(false);
      }
    });
  };

  const processCSVData = (data: CSVRow[]) => {
    if (data.length === 0) {
      setError('O arquivo CSV está vazio.');
      return;
    }

    // Assume que a primeira linha contém os dados principais
    const firstRow = data[0];
    
    if (!firstRow.periodo || !firstRow.dataInicio || !firstRow.dataFim) {
      setError('Campos obrigatórios não encontrados: período, dataInicio, dataFim');
      return;
    }

    // Agrupa materiais diagramados
    const diagrammedMaterials: DiagrammedMaterial[] = [];
    const groupedMaterials = new Map<string, DiagrammedMaterial>();

    data.forEach(row => {
      if (row.plataforma && row.programa && row.quantidade) {
        const key = `${row.plataforma}-${row.programa}`;
        const existing = groupedMaterials.get(key);
        const quantity = parseInt(row.quantidade) || 0;

        if (existing) {
          existing.quantity += quantity;
        } else {
          groupedMaterials.set(key, {
            platform: row.plataforma as 'AVACEAD' | 'AVAMEC',
            program: row.programa,
            quantity: quantity
          });
        }
      }
    });

    diagrammedMaterials.push(...Array.from(groupedMaterials.values()));

    const reportData: ReportData = {
      id: Date.now().toString(),
      period: firstRow.periodo,
      startDate: firstRow.dataInicio,
      endDate: firstRow.dataFim,
      materialProduction: {
        ebooks: parseInt(firstRow.ebooks) || 0,
        printedBooks: parseInt(firstRow.livrosImpressos) || 0
      },
      visualIdentity: {
        created: parseInt(firstRow.identidadesVisuais) || 0
      },
      diagrammedMaterials,
      createdAt: new Date().toISOString()
    };

    onImportData(reportData);
    
    toast({
      title: "Importação concluída",
      description: `Dados do período ${reportData.period} importados com sucesso.`,
    });

    // Limpa o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = `periodo,dataInicio,dataFim,ebooks,livrosImpressos,identidadesVisuais,plataforma,programa,quantidade
Janeiro/2025,2025-01-01,2025-01-31,5,3,2,AVACEAD,UAB,10
Janeiro/2025,2025-01-01,2025-01-31,5,3,2,AVAMEC,Formação Continuada,8`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-relatorio.csv';
    link.click();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-institutional">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Dados via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-institutional hover:bg-institutional-light"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Selecionar Arquivo'}
            </Button>
            
            <Button
              onClick={downloadTemplate}
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Baixar Modelo
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <h4 className="font-semibold mb-2">Formato esperado do CSV:</h4>
            <ul className="space-y-1 text-xs">
              <li>• <strong>periodo:</strong> Ex: Janeiro/2025</li>
              <li>• <strong>dataInicio:</strong> Ex: 2025-01-01</li>
              <li>• <strong>dataFim:</strong> Ex: 2025-01-31</li>
              <li>• <strong>ebooks:</strong> Número de e-books</li>
              <li>• <strong>livrosImpressos:</strong> Número de livros impressos</li>
              <li>• <strong>identidadesVisuais:</strong> Número de identidades criadas</li>
              <li>• <strong>plataforma:</strong> AVACEAD ou AVAMEC</li>
              <li>• <strong>programa:</strong> Nome do programa</li>
              <li>• <strong>quantidade:</strong> Quantidade de materiais</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}