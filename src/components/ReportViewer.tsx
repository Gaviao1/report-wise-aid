import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Calendar, Building2, Eye } from 'lucide-react';
import logoImage from '@/assets/institutional-logo.png';
import { ReportData } from '@/types/report';
import { ReportChart } from './ReportChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportViewerProps {
  reports: ReportData[];
  selectedReport: ReportData | null;
  onSelectReport: (report: ReportData) => void;
}

export function ReportViewer({ reports, selectedReport, onSelectReport }: ReportViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!selectedReport || !reportRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`relatorio-material-didatico-${selectedReport.period}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTotalMaterials = (report: ReportData) => {
    return report.diagrammedMaterials.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getMaterialsByPlatform = (report: ReportData) => {
    const platforms = report.diagrammedMaterials.reduce((acc, item) => {
      if (!acc[item.platform]) {
        acc[item.platform] = [];
      }
      acc[item.platform].push(item);
      return acc;
    }, {} as Record<string, typeof report.diagrammedMaterials>);
    
    return platforms;
  };

  const getAnalysisText = (report: ReportData) => {
    const totalMaterials = getTotalMaterials(report);
    const totalProduction = report.materialProduction.ebooks + report.materialProduction.printedBooks;
    const platforms = Object.keys(getMaterialsByPlatform(report));
    
    return {
      production: `No período de ${report.period}, foram produzidos ${totalProduction} materiais, sendo ${report.materialProduction.ebooks} e-books e ${report.materialProduction.printedBooks} livros impressos.`,
      identity: `Foram criadas ${report.visualIdentity.created} identidades visuais para cursos novos ou reformulados.`,
      diagrammed: `Foram diagramados ${totalMaterials} materiais distribuídos entre as plataformas ${platforms.join(' e ')}, atendendo diversos programas institucionais.`
    };
  };

  if (!selectedReport) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-institutional">
            <Eye className="h-5 w-5" />
            Visualização de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Selecione um relatório para visualizar:</p>
            <div className="space-y-2">
              {reports.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum relatório criado ainda.
                </p>
              ) : (
                reports.map((report) => (
                  <Card 
                    key={report.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{report.period}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.startDate).toLocaleDateString('pt-BR')} - {new Date(report.endDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {getTotalMaterials(report)} materiais
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysis = getAnalysisText(selectedReport);
  const platformData = getMaterialsByPlatform(selectedReport);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button
          onClick={() => onSelectReport(null as any)}
          variant="outline"
        >
          ← Voltar à Lista
        </Button>
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-institutional hover:bg-institutional-light"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-lg shadow-lg">
        {/* Cabeçalho do Relatório */}
        <div className="text-center mb-8 border-b pb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={logoImage} 
              alt="Logo Institucional" 
              className="w-full h-full object-contain bg-white"
            />
          </div>
          <h1 className="text-2xl font-bold text-institutional mb-2">
            RELATÓRIO DE ATIVIDADES
          </h1>
          <h2 className="text-xl text-institutional-light mb-2">
            Setor de Material Didático
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Período: {selectedReport.period}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(selectedReport.startDate).toLocaleDateString('pt-BR')} a {new Date(selectedReport.endDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Produção de Materiais Didáticos */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-institutional mb-4 border-l-4 border-institutional pl-3">
            1. Produção de Materiais Didáticos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-institutional mb-2">
                  {selectedReport.materialProduction.ebooks}
                </div>
                <p className="text-muted-foreground">E-books Finalizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-institutional mb-2">
                  {selectedReport.materialProduction.printedBooks}
                </div>
                <p className="text-muted-foreground">Livros Impressos</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-justify text-foreground">{analysis.production}</p>
        </section>

        <Separator className="my-6" />

        {/* Criação de Identidade Visual */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-institutional mb-4 border-l-4 border-institutional pl-3">
            2. Criação de Identidade Visual
          </h3>
          <Card className="mb-4">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-institutional mb-2">
                {selectedReport.visualIdentity.created}
              </div>
              <p className="text-muted-foreground">Identidades Visuais Criadas</p>
            </CardContent>
          </Card>
          <p className="text-justify text-foreground">{analysis.identity}</p>
        </section>

        <Separator className="my-6" />

        {/* Materiais Diagramados */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-institutional mb-4 border-l-4 border-institutional pl-3">
            3. Materiais Diagramados
          </h3>
          
          <div className="space-y-4 mb-6">
            {Object.entries(platformData).map(([platform, materials]) => (
              <div key={platform}>
                <h4 className="font-semibold text-institutional-light mb-3">
                  Plataforma: {platform}
                </h4>
                <div className="ml-4 space-y-2">
                  {materials.map((material, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted rounded">
                      <span>• Programa: {material.program}</span>
                      <Badge variant="secondary">{material.quantity} materiais</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-justify text-foreground">{analysis.diagrammed}</p>
        </section>

        {/* Gráficos */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-institutional mb-4 border-l-4 border-institutional pl-3">
            4. Análise Gráfica
          </h3>
          <ReportChart data={selectedReport} />
        </section>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          <p className="mt-1">Setor de Material Didático - Sistema de Relatórios Automatizado</p>
        </div>
      </div>
    </div>
  );
}