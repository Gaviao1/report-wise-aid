import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, FileText, BarChart3, Settings, Plus, Filter } from 'lucide-react';
import { DataEntry } from './DataEntry';
import { ReportViewer } from './ReportViewer';
import { ReportChart } from './ReportChart';
import { ReportData } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

export function ReportDashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Carregar relatórios do localStorage
  useEffect(() => {
    const savedReports = localStorage.getItem('material-didatico-reports');
    if (savedReports) {
      try {
        const parsedReports = JSON.parse(savedReports);
        setReports(parsedReports);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      }
    }
  }, []);

  // Salvar relatórios no localStorage
  useEffect(() => {
    localStorage.setItem('material-didatico-reports', JSON.stringify(reports));
  }, [reports]);

  const handleSaveReport = (reportData: ReportData) => {
    setReports(prev => [...prev, reportData]);
    toast({
      title: "Relatório salvo com sucesso!",
      description: `Relatório do período ${reportData.period} foi criado.`,
    });
  };

  const handleSelectReport = (report: ReportData | null) => {
    setSelectedReport(report);
  };

  const getFilteredReports = () => {
    let filtered = reports;

    if (filterPeriod !== 'all') {
      const currentDate = new Date();
      const monthsAgo = new Date();
      
      switch (filterPeriod) {
        case 'current':
          monthsAgo.setMonth(currentDate.getMonth());
          break;
        case 'last3':
          monthsAgo.setMonth(currentDate.getMonth() - 3);
          break;
        case 'last6':
          monthsAgo.setMonth(currentDate.getMonth() - 6);
          break;
      }
      
      filtered = filtered.filter(report => 
        new Date(report.endDate) >= monthsAgo
      );
    }

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(report =>
        report.diagrammedMaterials.some(material => 
          material.platform === filterPlatform
        )
      );
    }

    return filtered;
  };

  const getOverallStats = () => {
    const filteredReports = getFilteredReports();
    
    return {
      totalReports: filteredReports.length,
      totalEbooks: filteredReports.reduce((sum, report) => 
        sum + report.materialProduction.ebooks, 0
      ),
      totalPrintedBooks: filteredReports.reduce((sum, report) => 
        sum + report.materialProduction.printedBooks, 0
      ),
      totalVisualIdentities: filteredReports.reduce((sum, report) => 
        sum + report.visualIdentity.created, 0
      ),
      totalDiagrammedMaterials: filteredReports.reduce((sum, report) => 
        sum + report.diagrammedMaterials.reduce((matSum, mat) => matSum + mat.quantity, 0), 0
      )
    };
  };

  const getMostRecentReport = () => {
    if (reports.length === 0) return null;
    return reports.reduce((latest, current) => 
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );
  };

  const stats = getOverallStats();
  const mostRecentReport = getMostRecentReport();
  const filteredReports = getFilteredReports();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-institutional rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-institutional-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-institutional">
                Sistema de Relatórios
              </h1>
              <p className="text-institutional-light">
                Setor de Material Didático
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-institutional text-institutional-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total de Relatórios</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">E-books</p>
                  <p className="text-2xl font-bold text-institutional">{stats.totalEbooks}</p>
                </div>
                <div className="w-8 h-8 bg-institutional-lighter rounded-full flex items-center justify-center">
                  <span className="text-institutional text-xs font-bold">E</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Livros Impressos</p>
                  <p className="text-2xl font-bold text-institutional">{stats.totalPrintedBooks}</p>
                </div>
                <div className="w-8 h-8 bg-institutional-lighter rounded-full flex items-center justify-center">
                  <span className="text-institutional text-xs font-bold">L</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Identidades Visuais</p>
                  <p className="text-2xl font-bold text-institutional">{stats.totalVisualIdentities}</p>
                </div>
                <div className="w-8 h-8 bg-institutional-lighter rounded-full flex items-center justify-center">
                  <span className="text-institutional text-xs font-bold">ID</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Materiais Diagramados</p>
                  <p className="text-2xl font-bold text-institutional">{stats.totalDiagrammedMaterials}</p>
                </div>
                <div className="w-8 h-8 bg-institutional-lighter rounded-full flex items-center justify-center">
                  <span className="text-institutional text-xs font-bold">MD</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional">
              <Filter className="h-5 w-5" />
              Filtros de Visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterPeriod">Período</Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="current">Mês atual</SelectItem>
                    <SelectItem value="last3">Últimos 3 meses</SelectItem>
                    <SelectItem value="last6">Últimos 6 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterPlatform">Plataforma</Label>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as plataformas</SelectItem>
                    <SelectItem value="AVACEAD">AVACEAD</SelectItem>
                    <SelectItem value="AVAMEC">AVAMEC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Principal */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="entry" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Entrada
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              {mostRecentReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-institutional">Último Relatório Criado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{mostRecentReport.period}</h4>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(mostRecentReport.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSelectReport(mostRecentReport)}
                        className="bg-institutional hover:bg-institutional-light"
                      >
                        Visualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mostRecentReport && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-institutional">Análise do Último Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReportChart data={mostRecentReport} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="entry">
            <DataEntry onSaveReport={handleSaveReport} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportViewer
              reports={filteredReports}
              selectedReport={selectedReport}
              onSelectReport={handleSelectReport}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-institutional">Histórico de Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium">{report.period}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.endDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {report.diagrammedMaterials.reduce((sum, mat) => sum + mat.quantity, 0)} materiais
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-institutional">Estatísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Média de E-books por período:</span>
                      <span className="font-semibold">
                        {filteredReports.length > 0 ? 
                          (stats.totalEbooks / filteredReports.length).toFixed(1) : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Média de materiais diagramados:</span>
                      <span className="font-semibold">
                        {filteredReports.length > 0 ? 
                          (stats.totalDiagrammedMaterials / filteredReports.length).toFixed(1) : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plataforma mais utilizada:</span>
                      <span className="font-semibold">
                        {filteredReports.length > 0 ? 
                          (filteredReports.flatMap(r => r.diagrammedMaterials)
                            .reduce((acc, mat) => {
                              acc[mat.platform] = (acc[mat.platform] || 0) + mat.quantity;
                              return acc;
                            }, {} as Record<string, number>)
                          ) && Object.entries(
                            filteredReports.flatMap(r => r.diagrammedMaterials)
                              .reduce((acc, mat) => {
                                acc[mat.platform] = (acc[mat.platform] || 0) + mat.quantity;
                                return acc;
                              }, {} as Record<string, number>)
                          ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}