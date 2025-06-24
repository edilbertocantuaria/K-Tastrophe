"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Play, RotateCcw, ArrowDown, SkipForward, BarChart3, Info } from "lucide-react"
import RecursionTree from "./components/recursion-tree"

interface Step {
  type:
    | "divide"
    | "sort"
    | "extract"
    | "partition"
    | "boundary-explanation"
    | "boundary-decision"
    | "recurse"
    | "result"
  description: string
  array: number[]
  groups?: number[][]
  medians?: number[]
  pivot?: number
  left?: number[]
  equal?: number[]
  right?: number[]
  k?: number
  result?: number
  sizeL?: number
  sizeE?: number
  sizeR?: number
  recursionLevel?: number
  comparisons?: number
  operations?: number
  ignoredPercentage?: number
  originalArraySize?: number
}

interface AlgorithmStats {
  name: string
  steps: number
  comparisons: number
  operations: number
  worstCase: string
  averageCase: string
  bestCase: string
}

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

export default function Component() {
  const [inputArray, setInputArray] = useState("3,1,4,1,5,9,2,6,5,3,5")
  const [k, setK] = useState(6)
  const [findType, setFindType] = useState<"kth-smallest" | "kth-largest" | "median">("kth-smallest")
  const [steps, setSteps] = useState<Step[]>([])
  const [quickSelectSteps, setQuickSelectSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [momStats, setMomStats] = useState<AlgorithmStats | null>(null)
  const [quickSelectStats, setQuickSelectStats] = useState<AlgorithmStats | null>(null)
  const [currentQsStep, setCurrentQsStep] = useState(0)
  const [recursionTree, setRecursionTree] = useState<RecursionNode | null>(null)
  const [showRecursionTree, setShowRecursionTree] = useState(false)
  const [quickSelectTree, setQuickSelectTree] = useState<RecursionNode | null>(null)
  const [showMomTree, setShowMomTree] = useState(false)
  const [showQsTree, setShowQsTree] = useState(false)

  const parseArray = (str: string): number[] => {
    return str
      .split(",")
      .map((n) => Number.parseInt(n.trim()))
      .filter((n) => !isNaN(n))
  }

  const insertionSort = (arr: number[]): number[] => {
    const sorted = [...arr]
    for (let i = 1; i < sorted.length; i++) {
      const key = sorted[i]
      let j = i - 1
      while (j >= 0 && sorted[j] > key) {
        sorted[j + 1] = sorted[j]
        j--
      }
      sorted[j + 1] = key
    }
    return sorted
  }

  const quickSelect = (
    arr: number[],
    targetK: number,
    allSteps: Step[] = [],
    comparisons = 0,
    operations = 0,
    nodeId = "qs_root",
    parentNode: RecursionNode | null = null,
  ): { result: number; node: RecursionNode } => {
    operations++

    const currentNode: RecursionNode = {
      id: nodeId,
      array: [...arr],
      k: targetK,
      level: parentNode ? parentNode.level + 1 : 0,
      children: [],
      parent: parentNode?.id,
      type: "main",
      description: `QuickSelect: Array[${arr.length}], k=${targetK}`,
    }

    if (arr.length === 1) {
      allSteps.push({
        type: "result",
        description: `QuickSelect: Array com 1 elemento - resultado: ${arr[0]}`,
        array: [...arr],
        result: arr[0],
        comparisons,
        operations,
      })
      currentNode.result = arr[0]
      return { result: arr[0], node: currentNode }
    }

    const pivot = arr[0]
    allSteps.push({
      type: "extract",
      description: `QuickSelect: Escolhendo pivot: ${pivot} (primeiro elemento)`,
      array: [...arr],
      pivot,
      comparisons,
      operations,
    })

    const left: number[] = []
    const equal: number[] = []
    const right: number[] = []

    for (let i = 0; i < arr.length; i++) {
      comparisons++
      if (arr[i] < pivot) left.push(arr[i])
      else if (arr[i] === pivot) equal.push(arr[i])
      else right.push(arr[i])
    }

    allSteps.push({
      type: "partition",
      description: `QuickSelect: Particionando com pivot ${pivot}`,
      array: [...arr],
      pivot,
      left: [...left],
      equal: [...equal],
      right: [...right],
      comparisons,
      operations,
    })

    const sizeL = left.length
    const sizeE = equal.length

    if (sizeL >= targetK) {
      const ignoredPercentage = Math.round(((sizeE + arr.length - left.length) / arr.length) * 100)
      allSteps.push({
        type: "boundary-decision",
        description: `QuickSelect: |L| = ${sizeL} >= k = ${targetK}. Continuando no array L (${ignoredPercentage}% ignorado)`,
        array: [...left],
        k: targetK,
        comparisons,
        operations,
        ignoredPercentage,
        originalArraySize: arr.length,
      })

      const { result, node: leftChildNode } = quickSelect(
        left,
        targetK,
        allSteps,
        comparisons,
        operations,
        `${nodeId}_left`,
        currentNode,
      )
      currentNode.children.push(leftChildNode)
      currentNode.result = result
      return { result, node: currentNode }
    } else if (sizeL + sizeE >= targetK) {
      allSteps.push({
        type: "boundary-decision",
        description: `QuickSelect: Elemento encontrado no array E: ${pivot}`,
        array: [...arr],
        result: pivot,
        comparisons,
        operations,
      })
      currentNode.result = pivot
      return { result: pivot, node: currentNode }
    } else {
      const newK = targetK - sizeL - sizeE
      const ignoredPercentage = Math.round(((sizeL + sizeE) / arr.length) * 100)
      allSteps.push({
        type: "boundary-decision",
        description: `QuickSelect: Continuando no array R com novo_k = ${newK} (${ignoredPercentage}% ignorado)`,
        array: [...right],
        k: newK,
        comparisons,
        operations,
        ignoredPercentage,
        originalArraySize: arr.length,
      })

      const { result, node: rightChildNode } = quickSelect(
        right,
        newK,
        allSteps,
        comparisons,
        operations,
        `${nodeId}_right`,
        currentNode,
      )
      currentNode.children.push(rightChildNode)
      currentNode.result = result
      return { result, node: currentNode }
    }
  }

  const medianOfMedians = (
    arr: number[],
    targetK: number,
    allSteps: Step[] = [],
    originalSize = 0,
    recursionLevel = 0,
    comparisons = 0,
    operations = 0,
    nodeId = "root",
    parentNode: RecursionNode | null = null,
    nodeType: "main" | "medians" = "main",
  ): { result: number; node: RecursionNode } => {
    operations++

    if (originalSize === 0) {
      originalSize = arr.length
    }

    const currentNode: RecursionNode = {
      id: nodeId,
      array: [...arr],
      k: targetK,
      level: recursionLevel,
      children: [],
      parent: parentNode?.id,
      type: nodeType,
      description: `${nodeType === "main" ? "Principal" : "Medianas"}: Array[${arr.length}], k=${targetK}`,
    }

    if (arr.length === 1) {
      allSteps.push({
        type: "result",
        description: `MOM: Array com apenas 1 elemento - resultado: ${arr[0]}`,
        array: [...arr],
        result: arr[0],
        recursionLevel,
        comparisons,
        operations,
      })

      currentNode.result = arr[0]
      return { result: arr[0], node: currentNode }
    }

    if (arr.length <= 5) {
      const sorted = insertionSort(arr)
      comparisons += arr.length * Math.log2(arr.length)

      allSteps.push({
        type: "sort",
        description: `MOM: Array pequeno (≤5): ordenando diretamente`,
        array: [...arr],
        groups: [sorted],
        recursionLevel,
        comparisons,
        operations,
      })

      allSteps.push({
        type: "extract",
        description: `MOM: Selecionando o ${targetK}º elemento do array ordenado (posição ${targetK - 1})`,
        array: sorted,
        k: targetK,
        recursionLevel,
        comparisons,
        operations,
      })

      const result = sorted[targetK - 1]
      allSteps.push({
        type: "result",
        description: `MOM: Resultado encontrado: ${result}`,
        array: sorted,
        result,
        recursionLevel,
        comparisons,
        operations,
      })

      currentNode.result = result
      return { result, node: currentNode }
    }

    const groups: number[][] = []
    for (let i = 0; i < arr.length; i += 5) {
      groups.push(arr.slice(i, i + 5))
    }

    allSteps.push({
      type: "divide",
      description: `MOM: Dividindo em ${groups.length} grupos de 5 elementos`,
      array: [...arr],
      groups: groups.map((g) => [...g]),
      recursionLevel,
      comparisons,
      operations,
    })

    const sortedGroups: number[][] = []
    for (const group of groups) {
      const sorted = insertionSort(group)
      comparisons += group.length * Math.log2(group.length)
      sortedGroups.push(sorted)
    }

    allSteps.push({
      type: "sort",
      description: `MOM: Ordenando cada grupo (${groups.length} grupos)`,
      array: [...arr],
      groups: sortedGroups,
      recursionLevel,
      comparisons,
      operations,
    })

    const medians: number[] = []
    for (const sortedGroup of sortedGroups) {
      const median = sortedGroup[Math.floor((sortedGroup.length - 1) / 2)]
      medians.push(median)
    }

    allSteps.push({
      type: "extract",
      description: `MOM: Extraindo ${medians.length} medianas`,
      array: [...arr],
      groups: sortedGroups,
      medians: [...medians],
      recursionLevel,
      comparisons,
      operations,
    })

    const { result: pivot, node: childNode } = medianOfMedians(
      medians,
      Math.ceil(medians.length / 2),
      allSteps,
      originalSize,
      recursionLevel + 1,
      comparisons,
      operations,
      `${nodeId}_medians`,
      currentNode,
      "medians",
    )

    currentNode.children.push(childNode)

    allSteps.push({
      type: "extract",
      description: `MOM: Mediana das medianas encontrada: ${pivot}`,
      array: [...arr],
      pivot,
      recursionLevel,
      comparisons,
      operations,
    })

    const left: number[] = []
    const equal: number[] = []
    const right: number[] = []

    for (const num of arr) {
      comparisons++
      if (num < pivot) left.push(num)
      else if (num === pivot) equal.push(num)
      else right.push(num)
    }

    allSteps.push({
      type: "partition",
      description: `MOM: Particionando com pivot ${pivot}`,
      array: [...arr],
      pivot,
      left: [...left],
      equal: [...equal],
      right: [...right],
      recursionLevel,
      comparisons,
      operations,
    })

    const sizeL = left.length
    const sizeE = equal.length
    const sizeR = right.length

    allSteps.push({
      type: "boundary-explanation",
      description: `MOM: Analisando condições de contorno`,
      array: [...arr],
      pivot,
      left: [...left],
      equal: [...equal],
      right: [...right],
      sizeL,
      sizeE,
      sizeR,
      k: targetK,
      recursionLevel,
      comparisons,
      operations,
    })

    if (sizeL === targetK - 1) {
      const ignoredPercentage = Math.round(((sizeE + sizeR) / originalSize) * 100)
      allSteps.push({
        type: "boundary-decision",
        description: `MOM: |L| = k-1. Resultado: ${pivot} (${ignoredPercentage}% ignorado)`,
        array: [...arr],
        pivot,
        left: [...left],
        equal: [...equal],
        right: [...right],
        result: pivot,
        recursionLevel,
        comparisons,
        operations,
        ignoredPercentage,
        originalArraySize: originalSize,
      })

      currentNode.result = pivot
      return { result: pivot, node: currentNode }
    } else if (sizeL > targetK - 1) {
      const ignoredPercentage = Math.round(((sizeE + sizeR) / originalSize) * 100)
      allSteps.push({
        type: "boundary-decision",
        description: `MOM: |L| > k-1. Continuando no array L (${ignoredPercentage}% ignorado)`,
        array: [...left],
        k: targetK,
        recursionLevel,
        comparisons,
        operations,
        ignoredPercentage,
        originalArraySize: originalSize,
      })

      const { result, node: leftChildNode } = medianOfMedians(
        left,
        targetK,
        allSteps,
        originalSize,
        recursionLevel,
        comparisons,
        operations,
        `${nodeId}_left`,
        currentNode,
        "main",
      )

      currentNode.children.push(leftChildNode)
      currentNode.result = result
      return { result, node: currentNode }
    } else {
      const newK = targetK - sizeL - sizeE
      const ignoredPercentage = Math.round(((sizeL + sizeE) / originalSize) * 100)
      allSteps.push({
        type: "boundary-decision",
        description: `MOM: |L| < k-1. Continuando no array R com k=${newK} (${ignoredPercentage}% ignorado)`,
        array: [...right],
        k: newK,
        recursionLevel,
        comparisons,
        operations,
        ignoredPercentage,
        originalArraySize: originalSize,
      })

      const { result, node: rightChildNode } = medianOfMedians(
        right,
        newK,
        allSteps,
        originalSize,
        recursionLevel,
        comparisons,
        operations,
        `${nodeId}_right`,
        currentNode,
        "main",
      )

      currentNode.children.push(rightChildNode)
      currentNode.result = result
      return { result, node: currentNode }
    }
  }

  const runAlgorithm = () => {
    const arr = parseArray(inputArray)
    if (arr.length === 0) return

    let targetK = k
    if (findType === "median") {
      targetK = Math.ceil(arr.length / 2)
    } else if (findType === "kth-largest") {
      targetK = arr.length - k + 1
    }

    // Run Median of Medians
    const momSteps: Step[] = []
    momSteps.push({
      type: "divide",
      description: `MOM: Iniciando busca pelo ${findType === "median" ? "elemento mediano" : findType === "kth-smallest" ? `${k}º menor elemento` : `${k}º maior elemento`}`,
      array: [...arr],
      k: targetK,
      recursionLevel: 0,
      comparisons: 0,
      operations: 0,
    })

    const { result: momResult, node: treeRoot } = medianOfMedians(arr, targetK, momSteps, arr.length, 0, 0, 0)
    setRecursionTree(treeRoot)

    const lastMomStep = momSteps[momSteps.length - 1]

    // Run QuickSelect for comparison
    const qsSteps: Step[] = []
    qsSteps.push({
      type: "divide",
      description: `QuickSelect: Iniciando busca pelo ${findType === "median" ? "elemento mediano" : findType === "kth-smallest" ? `${k}º menor elemento` : `${k}º maior elemento`}`,
      array: [...arr],
      k: targetK,
      comparisons: 0,
      operations: 0,
    })

    const { result: qsResult, node: qsTreeRoot } = quickSelect([...arr], targetK, qsSteps, 0, 0)
    setQuickSelectTree(qsTreeRoot)

    const lastQsStep = qsSteps[qsSteps.length - 1]

    // Set statistics
    setMomStats({
      name: "Median of Medians",
      steps: momSteps.length,
      comparisons: lastMomStep.comparisons || 0,
      operations: lastMomStep.operations || 0,
      worstCase: "O(n)",
      averageCase: "O(n)",
      bestCase: "O(n)",
    })

    setQuickSelectStats({
      name: "QuickSelect",
      steps: qsSteps.length,
      comparisons: lastQsStep.comparisons || 0,
      operations: lastQsStep.operations || 0,
      worstCase: "O(n²)",
      averageCase: "O(n)",
      bestCase: "O(n)",
    })

    setSteps(momSteps)
    setQuickSelectSteps(qsSteps)
    setCurrentStep(0)
    setCurrentQsStep(0)
    setIsRunning(true)
  }

  const reset = () => {
    setSteps([])
    setQuickSelectSteps([])
    setCurrentStep(0)
    setCurrentQsStep(0)
    setIsRunning(false)
    setMomStats(null)
    setQuickSelectStats(null)
    setRecursionTree(null)
    setQuickSelectTree(null)
    setShowRecursionTree(false)
    setShowMomTree(false)
    setShowQsTree(false)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const nextQsStep = () => {
    if (currentQsStep < quickSelectSteps.length - 1) {
      setCurrentQsStep(currentQsStep + 1)
    }
  }

  const prevQsStep = () => {
    if (currentQsStep > 0) {
      setCurrentQsStep(currentQsStep - 1)
    }
  }

  const jumpToEnd = () => {
    if (steps.length > 0) {
      setCurrentStep(steps.length - 1)
    }
  }

  useEffect(() => {
    if (findType === "median") {
      const arr = parseArray(inputArray)
      if (arr.length > 0) {
        setK(Math.ceil(arr.length / 2))
      }
    }
  }, [findType, inputArray])

  const currentStepData = steps[currentStep]
  const currentQsStepData = quickSelectSteps[currentQsStep]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-center">
      <CardTitle className="flex items-center gap-3">
        <img src="/logo.png" alt="K-Tastrophe Logo" className="h-[3cm] w-[3cm] object-contain" />
        <div>
        <div className="text-4xl font-bold leading-tight" style={{ color: "#1796EE" }}>K-Tastrophe</div>
        <div className="text-2lg font-semibold leading-snug" style={{ color: "#FDAD1E" }}>A Caça ao k-ésimo</div>
        </div>
      </CardTitle>
      </div>
      <Card>
      <CardHeader>
          <CardDescription>
            Demonstração interativa com comparação QuickSelect e análise de complexidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="array">Array (separado por vírgulas)</Label>
              <Input
                id="array"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                placeholder="3,1,4,1,5,9,2,6,5,3,5"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="k">Valor de k</Label>
              <Input
                id="k"
                type="number"
                value={findType === "median" ? Math.ceil(parseArray(inputArray).length / 2) : k}
                onChange={(e) => setK(Number.parseInt(e.target.value) || 1)}
                min="1"
                disabled={isRunning || findType === "median"}
              />
            </div>
            <div>
              <Label>Tipo de busca</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={findType === "kth-smallest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFindType("kth-smallest")}
                  disabled={isRunning}
                >
                  k-ésimo menor
                </Button>
                <Button
                  variant={findType === "kth-largest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFindType("kth-largest")}
                  disabled={isRunning}
                >
                  k-ésimo maior
                </Button>
                <Button
                  variant={findType === "median" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFindType("median")}
                  disabled={isRunning}
                >
                  Mediana
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <Button onClick={runAlgorithm} disabled={isRunning}>
              <Play className="w-4 h-4 mr-2" />
              Executar Algoritmos
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>

            {isRunning && (
              <>
                <div className="h-6 w-px bg-border" />
                <Button onClick={() => setShowRecursionTree(!showRecursionTree)} variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  {showRecursionTree ? "Ocultar" : "Mostrar"} Árvores de Recursão
                </Button>
                <div className="h-6 w-px bg-border" />
                <Button onClick={jumpToEnd} variant="outline" size="sm">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Ir ao Final
                </Button>
              </>
            )}
          </div>

          {isRunning && <div className="space-y-3"></div>}
        </CardContent>
      </Card>

      {isRunning && currentStepData && (
        <Tabs defaultValue="mom" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mom">Median of Medians</TabsTrigger>
            <TabsTrigger value="quickselect">QuickSelect</TabsTrigger>
          </TabsList>

          <TabsContent value="mom">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      🏆 Median of Medians - Passo {currentStep + 1} de {steps.length}
                    </CardTitle>
                    {currentStepData.recursionLevel !== undefined && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono ${
                            currentStepData.recursionLevel === 0
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : currentStepData.recursionLevel === 1
                                ? "bg-purple-50 text-purple-700 border-purple-300"
                                : currentStepData.recursionLevel === 2
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : "bg-orange-50 text-orange-700 border-orange-300"
                          }`}
                        >
                          Nível {currentStepData.recursionLevel}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {"→".repeat(currentStepData.recursionLevel)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={prevStep} disabled={currentStep === 0} size="sm" variant="outline">
                      Anterior
                    </Button>
                    <Button onClick={nextStep} disabled={currentStep === steps.length - 1} size="sm">
                      Próximo
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {currentStepData.recursionLevel !== undefined && currentStepData.recursionLevel > 0 && (
                    <span className="text-xs text-muted-foreground mr-2">[Recursão para encontrar MOM]</span>
                  )}
                  {currentStepData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Array atual:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentStepData.array.map((num, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className={`text-sm ${currentStepData.pivot !== undefined && num === currentStepData.pivot ? "bg-green-100 text-green-800 border-green-300" : ""}`}
                      >
                        {num}
                      </Badge>
                    ))}
                  </div>
                </div>

                {currentStepData.groups && (
                  <div>
                    <Label className="text-sm font-medium">Grupos:</Label>
                    <div className="space-y-2 mt-1">
                      {currentStepData.groups.map((group, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Grupo {idx + 1}:</span>
                          <div className="flex gap-1">
                            {group.map((num, numIdx) => {
                              const isMedian =
                                currentStepData.type === "sort" && numIdx === Math.floor((group.length - 1) / 2)
                              return (
                                <Badge
                                  key={numIdx}
                                  variant="outline"
                                  className={`text-sm ${isMedian ? "bg-orange-100 text-orange-800 border-orange-300" : ""}`}
                                >
                                  {num}
                                </Badge>
                              )
                            })}
                          </div>
                          {currentStepData.medians && (
                            <>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <Badge className="text-sm bg-blue-100 text-blue-800">
                                Mediana: {currentStepData.medians[idx]}
                              </Badge>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.medians && !currentStepData.groups && (
                  <div>
                    <Label className="text-sm font-medium">Medianas extraídas:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentStepData.medians.map((median, idx) => (
                        <Badge key={idx} className="text-sm bg-blue-100 text-blue-800">
                          {median}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.pivot !== undefined && (
                  <div>
                    <Label className="text-sm font-medium">Pivot (Mediana das Medianas):</Label>
                    <Badge className="ml-2 text-sm bg-green-100 text-green-800">{currentStepData.pivot}</Badge>
                  </div>
                )}

                {currentStepData.left && currentStepData.equal && currentStepData.right && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Particionamento:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-semibold text-red-700">
                          Array L (menores que {currentStepData.pivot}):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentStepData.left.map((num, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm bg-red-100 text-red-800">
                              {num}
                            </Badge>
                          ))}
                        </div>
                        {currentStepData.sizeL !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">Tamanho: {currentStepData.sizeL}</div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-yellow-700">
                          Array E (iguais a {currentStepData.pivot}):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentStepData.equal.map((num, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm bg-yellow-100 text-yellow-800">
                              {num}
                            </Badge>
                          ))}
                        </div>
                        {currentStepData.sizeE !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">Tamanho: {currentStepData.sizeE}</div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-blue-700">
                          Array R (maiores que {currentStepData.pivot}):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentStepData.right.map((num, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm bg-blue-100 text-blue-800">
                              {num}
                            </Badge>
                          ))}
                        </div>
                        {currentStepData.sizeR !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">Tamanho: {currentStepData.sizeR}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.type === "boundary-explanation" && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-blue-800">Condições de Contorno:</Label>
                        <div className="text-sm space-y-1">
                          <div>• Se |L| == k-1, então o k-ésimo elemento é a MOM</div>
                          <div>• Se |L| {">"} k-1, continua com array L mantendo k</div>
                          <div>• Se |L| {"<"} k-1, continua com array R e novo_k = k - |L| - |E|</div>
                        </div>
                        <div className="mt-3 p-2 bg-white rounded border">
                          <div className="text-sm">
                            <strong>Valores atuais:</strong>
                          </div>
                          <div className="text-sm">• |L| = {currentStepData.sizeL}</div>
                          <div className="text-sm">• |E| = {currentStepData.sizeE}</div>
                          <div className="text-sm">• |R| = {currentStepData.sizeR}</div>
                          <div className="text-sm">• k = {currentStepData.k}</div>
                          <div className="text-sm">• k-1 = {currentStepData.k! - 1}</div>
                        </div>
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <div className="text-sm font-semibold text-green-800">
                            Conclusão:{" "}
                            {currentStepData.sizeL === currentStepData.k! - 1
                              ? "A MOM é o k-ésimo elemento!"
                              : currentStepData.sizeL! > currentStepData.k! - 1
                                ? "Continuar busca no array L"
                                : "Continuar busca no array R"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.k && currentStepData.type !== "boundary-explanation" && (
                  <div>
                    <Label className="text-sm font-medium">Buscando k-ésimo elemento:</Label>
                    <Badge className="ml-2 text-sm bg-purple-100 text-purple-800">k = {currentStepData.k}</Badge>
                  </div>
                )}

                {currentStepData.type === "extract" && currentStepData.k && !currentStepData.pivot && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-yellow-800">Seleção do k-ésimo elemento:</Label>
                        <div className="text-sm space-y-1">
                          <div>• Array ordenado: {currentStepData.array.join(", ")}</div>
                          <div>• Buscando o {currentStepData.k}º elemento</div>
                          <div>• Posição no array (índice): {currentStepData.k - 1}</div>
                          <div>
                            • Elemento selecionado: <strong>{currentStepData.array[currentStepData.k - 1]}</strong>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {currentStepData.array.map((num, idx) => (
                              <Badge
                                key={idx}
                                variant={idx === currentStepData.k - 1 ? "default" : "outline"}
                                className={`text-sm ${idx === currentStepData.k - 1 ? "bg-yellow-500 text-white" : ""}`}
                              >
                                {num}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.result !== undefined && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDown className="w-5 h-5 text-green-600" />
                      <Label className="text-lg font-semibold text-green-800">
                        Resultado: {currentStepData.result}
                      </Label>
                    </div>
                    {currentStep === steps.length - 1 && (
                      <div className="text-sm text-green-700">
                        🎯 O algoritmo encontrou com sucesso o{" "}
                        {findType === "median"
                          ? "elemento mediano"
                          : findType === "kth-smallest"
                            ? `${k}º menor elemento`
                            : `${k}º maior elemento`}{" "}
                        do array original!
                      </div>
                    )}
                  </div>
                )}

                {currentStepData.ignoredPercentage === 0 ||
                  (currentStepData.ignoredPercentage !== undefined && currentStepData.recursionLevel === 0 && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <Label className="text-lg font-semibold text-purple-800">Eficiência da Eliminação</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Array original:</span>
                          <Badge variant="outline">{parseArray(inputArray).length} elementos</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Array atual:</span>
                          <Badge variant="outline">{currentStepData.array.length} elementos</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Elementos ignorados:</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {Math.round(
                              ((parseArray(inputArray).length - currentStepData.array.length) /
                                parseArray(inputArray).length) *
                                100,
                            )}
                            % ({parseArray(inputArray).length - currentStepData.array.length} elementos)
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progresso da eliminação</span>
                            <span>
                              {Math.round(
                                ((parseArray(inputArray).length - currentStepData.array.length) /
                                  parseArray(inputArray).length) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={Math.round(
                              ((parseArray(inputArray).length - currentStepData.array.length) /
                                parseArray(inputArray).length) *
                                100,
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="text-xs text-purple-700 mt-2">
                          💡 O algoritmo MOM garante que pelo menos 30% dos elementos são eliminados a cada recursão!
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quickselect">
            {currentQsStepData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      ⚡ QuickSelect - Passo {currentQsStep + 1} de {quickSelectSteps.length}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={prevQsStep} disabled={currentQsStep === 0} size="sm" variant="outline">
                        Anterior
                      </Button>
                      <Button onClick={nextQsStep} disabled={currentQsStep === quickSelectSteps.length - 1} size="sm">
                        Próximo
                      </Button>
                      <Button onClick={() => setCurrentQsStep(quickSelectSteps.length - 1)} variant="outline" size="sm">
                        <SkipForward className="w-4 h-4 mr-2" />
                        Ir ao Final
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{currentQsStepData.description}</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {isRunning && showRecursionTree && recursionTree && (
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setShowMomTree(!showMomTree)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-700">🌳🏆 Árvore de Recursão - Median of Medians</span>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${showMomTree ? "rotate-90" : ""}`} />
            </Button>
          </CardHeader>
          {showMomTree && (
            <CardContent>
              <RecursionTree tree={recursionTree} />
            </CardContent>
          )}
        </Card>
      )}
      {isRunning && showRecursionTree && quickSelectTree && (
        <Card className="mt-6">
          <CardHeader>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto"
              onClick={() => setShowQsTree(!showQsTree)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-orange-700">🌳⚡ Árvore de Recursão - QuickSelect</span>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${showQsTree ? "rotate-90" : ""}`} />
            </Button>
          </CardHeader>
          {showQsTree && (
            <CardContent>
              <RecursionTree tree={quickSelectTree} />
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Como funcionam os algoritmos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="mom-explanation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mom-explanation">Median of Medians</TabsTrigger>
              <TabsTrigger value="qs-explanation">QuickSelect</TabsTrigger>
            </TabsList>

            <TabsContent value="mom-explanation" className="space-y-3 text-sm">
              <div>
                <strong>1. Divisão:</strong> O array é dividido em grupos de 5 elementos cada.
              </div>
              <div>
                <strong>2. Ordenação:</strong> Cada grupo é ordenado individualmente (O(1) pois são apenas 5 elementos).
              </div>
              <div>
                <strong>3. Extração de medianas:</strong> A mediana de cada grupo é extraída.
              </div>
              <div>
                <strong>4. Recursão:</strong> O algoritmo é aplicado recursivamente no array das medianas para encontrar
                a "mediana das medianas".
              </div>
              <div>
                <strong>5. Particionamento:</strong> O array original é particionado usando a mediana das medianas como
                pivot.
              </div>
              <div>
                <strong>6. Análise de condições:</strong> Os arrays L, E, R são analisados para determinar o próximo
                passo.
              </div>
              <div>
                <strong>7. Decisão:</strong> Baseado na posição k desejada, o algoritmo continua na partição esquerda ou
                direita.
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <strong>Complexidade:</strong> O(n) no pior caso, garantindo performance linear mesmo em casos adversos.
              </div>
            </TabsContent>

            <TabsContent value="qs-explanation" className="space-y-3 text-sm">
              <div>
                <strong>1. Escolha do Pivot:</strong> Seleciona um elemento como pivot (geralmente o primeiro).
              </div>
              <div>
                <strong>2. Particionamento:</strong> Divide o array em elementos menores, iguais e maiores que o pivot.
              </div>
              <div>
                <strong>3. Decisão:</strong> Baseado no tamanho das partições, decide qual lado explorar.
              </div>
              <div>
                <strong>4. Recursão:</strong> Aplica o algoritmo recursivamente na partição escolhida.
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <strong>Complexidade:</strong> O(n) no caso médio, mas O(n²) no pior caso (arrays ordenados).
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <strong>Problema:</strong> A escolha ingênua do pivot pode levar a performance ruim em casos
                específicos.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
