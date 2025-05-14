
import React from 'react';
import InsightCard from './InsightCard';

const InsightsContainer: React.FC = () => {
  return (
    <div className="dashboard-card p-4">
      <h3 className="text-base font-medium mb-4">Insights e Alertas</h3>
      <div className="space-y-3">
        <InsightCard 
          type="success" 
          title="Melhor Campanha" 
          description="Remarketing - Abandono de Carrinho tem o melhor CPA"
          metric="R$ 22,39" 
        />
        <InsightCard 
          type="danger" 
          title="Pixel Inativo" 
          description="Campanha YouTube - Brand Awareness está com o pixel desativado"
        />
        <InsightCard 
          type="warning" 
          title="CPC Aumentando" 
          description="O CPC aumentou 15% em relação ao período anterior"
          metric="R$ 2,80 → R$ 3,22" 
        />
        <InsightCard 
          type="info" 
          title="ROAS Positivo" 
          description="Seu retorno sobre investimento está acima da média do setor"
          metric="2.83x" 
        />
      </div>
    </div>
  );
};

export default InsightsContainer;
