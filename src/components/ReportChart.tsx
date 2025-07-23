import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ReportData } from '@/types/report';

interface ReportChartProps {
  data: ReportData;
}

export function ReportChart({ data }: ReportChartProps) {
  // Dados para gráfico de barras - Produção
  const productionData = [
    {
      name: 'E-books',
      quantidade: data.materialProduction.ebooks,
      fill: 'hsl(var(--institutional))'
    },
    {
      name: 'Livros Impressos',
      quantidade: data.materialProduction.printedBooks,
      fill: 'hsl(var(--institutional-light))'
    },
    {
      name: 'Identidades Visuais',
      quantidade: data.visualIdentity.created,
      fill: 'hsl(var(--accent))'
    }
  ];

  // Dados para gráfico de pizza - Materiais por plataforma
  const platformData = data.diagrammedMaterials.reduce((acc, item) => {
    const existing = acc.find(p => p.name === item.platform);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({
        name: item.platform,
        value: item.quantity
      });
    }
    return acc;
  }, [] as { name: string; value: number; }[]);

  // Dados para gráfico de barras - Materiais por programa
  const programData = data.diagrammedMaterials.map(item => ({
    name: item.program.length > 15 ? item.program.substring(0, 15) + '...' : item.program,
    quantidade: item.quantity,
    plataforma: item.platform,
    fill: item.platform === 'AVACEAD' ? 'hsl(var(--institutional))' : 'hsl(var(--institutional-light))'
  }));

  const COLORS = [
    'hsl(var(--institutional))',
    'hsl(var(--institutional-light))',
    'hsl(var(--accent))',
    'hsl(var(--success))',
    'hsl(var(--warning))'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Produção Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-institutional">Produção Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição por Plataforma */}
      {platformData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-institutional">Materiais por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Materiais por Programa */}
      {programData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-institutional">Materiais Diagramados por Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(label) => `Programa: ${label}`}
                  formatter={(value, name, props) => [
                    `${value} materiais`, 
                    `Plataforma: ${props.payload.plataforma}`
                  ]}
                />
                <Bar dataKey="quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}