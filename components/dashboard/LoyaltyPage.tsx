"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Star, Trophy, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNotification } from "@/contexts/NotificationContext"
import { supabase } from "@/lib/supabase"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface LoyaltyData {
  totalPoints: number
  pointsHistory: {
    id: string
    points: number
    transaction_type: string
    description: string
    created_at: string
  }[]
}

interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  category: string
  available: boolean
}

export default function LoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({ totalPoints: 0, pointsHistory: [] })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    loadLoyaltyData()
    loadRewards()
  }, [user])

  const loadLoyaltyData = async () => {
    if (!user) return

    try {
      // Get total points
      const { data: pointsData, error: pointsError } = await supabase
        .from("loyalty_points")
        .select("points, transaction_type")
        .eq("user_id", user.id)

      if (pointsError) throw pointsError

      const totalPoints =
        pointsData?.reduce((total, record) => {
          return record.transaction_type === "earned" ? total + record.points : total - record.points
        }, 0) || 0

      // Get points history
      const { data: historyData, error: historyError } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (historyError) throw historyError

      setLoyaltyData({
        totalPoints,
        pointsHistory: historyData || [],
      })
    } catch (error) {
      console.error("Error loading loyalty data:", error)
      showError("Erro", "Falha ao carregar dados de fidelidade")
    }
  }

  const loadRewards = async () => {
    // Mock rewards data - in a real app, this would come from the database
    const mockRewards: Reward[] = [
      {
        id: "1",
        name: "Lavagem Simples Grátis",
        description: "Resgate uma lavagem simples gratuita",
        points_required: 100,
        category: "service",
        available: true,
      },
      {
        id: "2",
        name: "15% de Desconto",
        description: "Cupom de 15% de desconto em qualquer serviço",
        points_required: 150,
        category: "discount",
        available: true,
      },
      {
        id: "3",
        name: "Polimento Gratuito",
        description: "Serviço completo de polimento sem custo",
        points_required: 300,
        category: "service",
        available: true,
      },
      {
        id: "4",
        name: "Vitrificação 50% OFF",
        description: "Metade do preço no serviço premium de vitrificação",
        points_required: 400,
        category: "discount",
        available: true,
      },
      {
        id: "5",
        name: "Kit de Limpeza",
        description: "Kit completo de produtos para limpeza doméstica",
        points_required: 250,
        category: "product",
        available: true,
      },
      {
        id: "6",
        name: "Mês VIP",
        description: "Acesso prioritário e descontos especiais por 30 dias",
        points_required: 500,
        category: "vip",
        available: true,
      },
    ]

    setRewards(mockRewards)
    setLoading(false)
  }

  const redeemReward = async (reward: Reward) => {
    if (loyaltyData.totalPoints < reward.points_required) {
      showError("Pontos Insuficientes", "Você não possui pontos suficientes para este prêmio")
      return
    }

    try {
      // Deduct points
      const { error } = await supabase.from("loyalty_points").insert([
        {
          user_id: user?.id,
          points: reward.points_required,
          transaction_type: "redeemed",
          description: `Resgate: ${reward.name}`,
        },
      ])

      if (error) throw error

      showSuccess("Prêmio Resgatado!", `${reward.name} foi adicionado à sua conta`)
      loadLoyaltyData()
    } catch (error) {
      console.error("Error redeeming reward:", error)
      showError("Erro", "Falha ao resgatar prêmio")
    }
  }

  // Loyalty levels system
  const loyaltyLevels = [
    { name: "Bronze", minPoints: 0, maxPoints: 299, color: "bg-amber-600", benefits: ["Acúmulo de pontos básico"] },
    { name: "Prata", minPoints: 300, maxPoints: 799, color: "bg-gray-400", benefits: ["5% desconto extra", "Prioridade no atendimento"] },
    { name: "Ouro", minPoints: 800, maxPoints: 1499, color: "bg-yellow-500", benefits: ["10% desconto extra", "Lavagem express gratuita mensal"] },
    { name: "Platina", minPoints: 1500, maxPoints: 2999, color: "bg-blue-500", benefits: ["15% desconto extra", "Serviços premium com desconto"] },
    { name: "Diamante", minPoints: 3000, maxPoints: Infinity, color: "bg-purple-600", benefits: ["20% desconto extra", "Acesso VIP", "Agendamento prioritário"] }
  ]

  const getCurrentLevel = () => {
    return loyaltyLevels.find(level => 
      loyaltyData.totalPoints >= level.minPoints && loyaltyData.totalPoints <= level.maxPoints
    ) || loyaltyLevels[0]
  }

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel()
    const currentIndex = loyaltyLevels.indexOf(currentLevel)
    return currentIndex < loyaltyLevels.length - 1 ? loyaltyLevels[currentIndex + 1] : null
  }

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel()
    const nextLevel = getNextLevel()
    
    if (!nextLevel) return 100 // Max level reached
    
    const pointsInCurrentRange = loyaltyData.totalPoints - currentLevel.minPoints
    const totalPointsInRange = nextLevel.minPoints - currentLevel.minPoints
    
    return (pointsInCurrentRange / totalPointsInRange) * 100
  }

  const currentLevel = getCurrentLevel()
  const nextLevel = getNextLevel()
  const progressToNext = getProgressToNextLevel()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
        <p className="text-gray-600">Acumule pontos e troque por prêmios incríveis</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Pontos Totais</p>
                <p className="text-3xl font-bold">{loyaltyData.totalPoints}</p>
              </div>
              <Gift className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600">Nível Atual</p>
                <p className="text-xl font-bold">{currentLevel?.name}</p>
              </div>
              <Trophy className={`w-8 h-8 ${currentLevel?.color.replace("bg-", "text-")}`} />
            </div>
            {nextLevel && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Próximo: {nextLevel.name}</span>
                  <span>{nextLevel.minPoints - loyaltyData.totalPoints} pontos</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Prêmios Disponíveis</p>
                <p className="text-xl font-bold">
                  {rewards.filter((r) => loyaltyData.totalPoints >= r.points_required).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Como Funciona</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Faça Serviços</h3>
              <p className="text-sm text-gray-600">Ganhe 1 ponto para cada R$ 10 gastos em nossos serviços</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Acumule Pontos</h3>
              <p className="text-sm text-gray-600">Seus pontos nunca expiram e podem ser usados a qualquer momento</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Troque por Prêmios</h3>
              <p className="text-sm text-gray-600">Resgate seus pontos por serviços gratuitos e descontos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Prêmios Disponíveis</CardTitle>
          <CardDescription>Troque seus pontos por estes prêmios incríveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canRedeem = loyaltyData.totalPoints >= reward.points_required
              const categoryIcons = {
                service: "🚗",
                discount: "💰",
                product: "🎁",
                vip: "👑",
              }

              return (
                <Card key={reward.id} className={`${canRedeem ? "ring-2 ring-blue-500" : "opacity-75"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{categoryIcons[reward.category as keyof typeof categoryIcons]}</div>
                      <Badge variant={canRedeem ? "default" : "secondary"}>{reward.points_required} pts</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{reward.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                    <Button className="w-full" disabled={!canRedeem} onClick={() => redeemReward(reward)}>
                      {canRedeem ? "Resgatar" : "Pontos Insuficientes"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pontos</CardTitle>
          <CardDescription>Acompanhe como você ganhou e gastou seus pontos</CardDescription>
        </CardHeader>
        <CardContent>
          {loyaltyData.pointsHistory.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma transação de pontos ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loyaltyData.pointsHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === "earned"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.transaction_type === "earned" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.transaction_type === "earned" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.transaction_type === "earned" ? "+" : "-"}
                    {transaction.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
