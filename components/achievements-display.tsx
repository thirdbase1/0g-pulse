"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import type { Achievement } from "@/lib/types"

interface AchievementsDisplayProps {
  achievements: Achievement[]
}

export function AchievementsDisplay({ achievements }: AchievementsDisplayProps) {
  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Achievements</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {unlockedAchievements.length} / {achievements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Unlocked</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Locked</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30 opacity-60"
                  >
                    <span className="text-2xl grayscale">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-muted-foreground">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
