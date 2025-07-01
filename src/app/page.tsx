// app/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChallengeOne } from "@/components/vertical-voyage/ChallengeOne";
import { ChallengeTwo } from "@/components/vertical-voyage/ChallengeTwo";
import { Bot, Trophy } from "lucide-react";

export default function VerticalVoyagePage() {

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-2 sm:p-4 pt-4 sm:pt-8">
       <Card className="w-full max-w-4xl lg:max-w-7xl shadow-2xl border-primary/50 border mb-4">
         <CardHeader className="text-center pb-2 pt-4">
           <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary">Vertical Voyage</CardTitle>
           <CardDescription className="text-xs sm:text-sm text-muted-foreground">The Ultimate Elevator Algorithm Challenge</CardDescription>
         </CardHeader>
       </Card>

      <Tabs defaultValue="challenge1" className="w-full max-w-4xl lg:max-w-7xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenge1">
            <Trophy className="w-4 h-4 mr-2" />
            Challenge 1: Optimization
          </TabsTrigger>
          <TabsTrigger value="challenge2">
            <Bot className="w-4 h-4 mr-2" />
            Challenge 2: Head-to-Head
          </TabsTrigger>
        </TabsList>
        <TabsContent value="challenge1" className="mt-4">
            <ChallengeOne />
        </TabsContent>
        <TabsContent value="challenge2" className="mt-4">
            <ChallengeTwo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
