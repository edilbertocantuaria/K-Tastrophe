import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecursionNode {
  id: string
  array: number[]
  k: number
  level: number
  result?: number
  children: RecursionNode[]
  parent?: string
  type: "main" | "medians"
  description: string
}

interface RecursionTreeProps {
  tree: RecursionNode
}

const TreeNode = ({ node, isRoot = false }: { node: RecursionNode; isRoot?: boolean }) => {
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Card
          className={`w-64 ${node.type === "medians" ? "border-purple-300 bg-purple-50" : "border-blue-300 bg-blue-50"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className={`${node.type === "medians" ? "text-purple-700" : "text-blue-700"}`}>
                {node.type === "medians" ? "🔍 Medianas" : "🎯 Principal"}
              </span>
              <Badge variant="outline" className="text-xs">
                Nível {node.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div>
              <div className="text-xs text-muted-foreground">Array ({node.array.length} elementos):</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.array.slice(0, 8).map((num, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {num}
                  </Badge>
                ))}
                {node.array.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{node.array.length - 8}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs">
                <span className="text-muted-foreground">k = </span>
                <Badge className="bg-green-100 text-green-800 text-xs">{node.k}</Badge>
              </div>
              {node.result !== undefined && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Resultado = </span>
                  <Badge className="bg-orange-100 text-orange-800 text-xs">{node.result}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {hasChildren && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
        )}
      </div>

      {hasChildren && (
        <div className="mt-8 relative">
          {node.children.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 transform -translate-y-4"></div>
          )}

          <div className="flex gap-8 justify-center">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-300"></div>
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecursionTree({ tree }: RecursionTreeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>
            • <span className="text-blue-700">🎯 Azul</span>: Chamadas principais do algoritmo
          </div>
          <div>
            • <span className="text-purple-700">🔍 Roxo</span>: Chamadas para encontrar mediana das medianas
          </div>
          <div>• Cada nó mostra o array atual, valor de k e resultado (quando disponível)</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max flex justify-center">
            <TreeNode node={tree} isRoot={true} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
