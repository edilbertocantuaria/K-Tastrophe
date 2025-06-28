# K-Tastrophe: A Caça ao k-ésimo

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</div>

## 🎥 Vídeo Explicativo

- Apresentado por Edilberto: [Clique aqui para assistir no YouTube](https://youtu.be/UYxMdEQIRCk).

Neste vídeo, é feita uma explicação detalhada sobre o funcionamento do algoritmo Mediana das Medianas (Median of Medians - MOM), com foco no raciocínio por trás da implementação, nos passos do algoritmo e na comparação com o QuickSelect.

## 📋 Sobre o Projeto

K-Tastrophe é uma aplicação interativa que demonstra o funcionamento do algoritmo **Mediana das Medianas (MOM)** passo a passo. O sistema permite visualizar como o algoritmo encontra o k-ésimo menor elemento, k-ésimo maior elemento ou a mediana exata de um array, comparando sua performance com o algoritmo QuickSelect tradicional.

## 🎯 Funcionalidades

- **Visualização Passo a Passo**: Acompanhe cada etapa do algoritmo Mediana das Medianas
- **Comparação com QuickSelect**: Veja as diferenças de performance entre os dois algoritmos
- **Busca Personalizada**: Encontre o k-ésimo menor, k-ésimo maior elemento ou a mediana exata
- **Interface Interativa**: Navegue pelos passos com controles intuitivos
- **Análise de Complexidade**: Visualize métricas de eficiência e eliminação de elementos
- **Explicações Detalhadas**: Compreenda cada decisão do algoritmo com explicações claras

### 🧮 Algoritmos Implementados

#### Mediana das Medianas (MOM)

O algoritmo Mediana das Medianas é uma técnica determinística para encontrar o k-ésimo elemento de um array com complexidade **O(n)** garantida no pior caso:

1. **Divisão**: O array é dividido em grupos de 5 elementos
2. **Ordenação**: Cada grupo é ordenado individualmente usando insertion sort
3. **Extração de Medianas**: A mediana de cada grupo é extraída
4. **Recursão**: O algoritmo é aplicado recursivamente para encontrar a mediana das medianas
5. **Particionamento**: O array original é particionado usando a mediana das medianas como pivot
6. **Decisão**: Baseado nas condições de contorno, continua na partição apropriada

#### QuickSelect

Implementação do algoritmo QuickSelect tradicional para comparação:

- **Complexidade**: O(n) no caso médio, O(n²) no pior caso
- **Estratégia de Pivot**: Utiliza o primeiro elemento (demonstra vulnerabilidade a arrays ordenados)
- **Particionamento**: Divide em elementos menores, iguais e maiores que o pivot

### 📊 Análise de Performance

A aplicação demonstra visualmente:

- **Número de comparações** realizadas por cada algoritmo
- **Porcentagem de elementos eliminados** a cada recursão
- **Garantia de eliminação** de pelo menos 30% dos elementos no MOM
- **Diferenças de comportamento** em casos adversos

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

1. Clone o repositório:

   ```bash
   git clone https://github.com/edilbertocantuaria/K-Tastrophe
   cd K-Tastrophe
   ```

2. Instale as dependências:

   ```shellscript
   cd code
   yarn install
   ```

3. Realizar o build do projeto:

   ```shellscript
   yarn run build
   ```

4. Execute o projeto em modo de desenvolvimento:

   ```shellscript
   yarn dev
   ```

5. Acesse o aplicativo em seu navegador:

   ```plaintext
   http://localhost:3000
   ```

## 🛠️ Tecnologias Utilizadas

- **Frontend**:

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 3.4
- Shadcn/ui (componentes)
- Lucide React (ícones)

- **Algoritmos**:

- Median of Medians (Determinístico)
- QuickSelect (Probabilístico)
- Insertion Sort (para grupos pequenos)

## 🎓 Uso Educacional

Esta aplicação é ideal para:

- **Estudantes de Ciência da Computação** aprendendo algoritmos de seleção
- **Professores** demonstrando conceitos de complexidade algorítmica
- **Desenvolvedores** interessados em algoritmos determinísticos vs probabilísticos
- **Pesquisadores** analisando comportamento de algoritmos em diferentes cenários

### 📚 Conceitos Abordados

- Algoritmos de seleção determinísticos
- Análise de complexidade temporal
- Estratégias de escolha de pivot
- Particionamento de arrays
- Recursão e condições de parada
- Comparação de performance algorítmica

## 🎮 Como Usar

1. **Insira um array**: Digite números separados por vírgulas
2. **Escolha o tipo de busca**: k-ésimo menor, k-ésimo maior ou mediana (nesse último caso, a mediana exata)
3. **Execute os algoritmos**: Clique em "Executar Algoritmos"
4. **Navegue pelos passos**: Use os botões "Anterior" e "Próximo"
5. **Compare algoritmos**: Ative a comparação para ver QuickSelect
6. **Analise resultados**: Observe as métricas de performance

## 📈 Exemplos de Uso

```javascript
// Exemplo de array para teste
Array: 856, 692, 306, 215, 884, 776, 538, 98, 162, 785, 62, 320, 303, 333, 40, 123, 569, 504, 844, 453

// Buscar mediana (elemento central)
Tipo: Mediana
Resultado: Elemento na posição ⌈n/2⌉

// Buscar 5º menor elemento
Tipo: k-ésimo menor, k=5
Resultado: 5º elemento em ordem crescente
```

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### 💡 Ideias para Contribuições

- Implementação de outros algoritmos de seleção
- Visualização gráfica da árvore de recursão
- Modo de análise estatística avançada
- Suporte a diferentes tipos de dados
- Testes automatizados para os algoritmos

## 🏆 Reconhecimentos

- Algoritmo Median of Medians desenvolvido por Blum, Floyd, Pratt, Rivest e Tarjan (1973)
- Interface inspirada em ferramentas educacionais modernas
- Componentes UI baseados em Shadcn/ui

---

<div align="center">
  <p>Desenvolvido com ❤️ por Edilberto Almeida Cantuária e Kauan de Torres Eiras</p>
  <p>Universidade de Brasília - Faculdade do Gama</p>
</div>
