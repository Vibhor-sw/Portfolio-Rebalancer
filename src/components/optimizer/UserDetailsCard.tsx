import * as React from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { USER_PROFILE } from "@/lib/mockData";

export function UserDetailsCard() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{USER_PROFILE.name}</p>
              <p className="text-xs text-muted-foreground">{USER_PROFILE.profession}</p>
              <Badge variant="accent" className="mt-1">
                {USER_PROFILE.riskProfile} Risk
              </Badge>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Info className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{USER_PROFILE.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">{USER_PROFILE.age}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Marital Status</p>
                <p className="font-medium">{USER_PROFILE.maritalStatus}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Risk Profile</p>
                <p className="font-medium">{USER_PROFILE.riskProfile}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Profession</p>
                <p className="font-medium">{USER_PROFILE.profession}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Investment Summary</p>
              <p className="text-xs leading-relaxed">{USER_PROFILE.investmentSummary}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Personality</p>
              <p className="text-xs leading-relaxed">{USER_PROFILE.personality}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Investment Habits</p>
              <ul className="list-disc space-y-1 pl-4 text-xs">
                {USER_PROFILE.habits.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
