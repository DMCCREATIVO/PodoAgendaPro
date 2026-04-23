<![CDATA[import { useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompanySwitcher() {
  const { companies, currentCompany, switchCompany, isLoading } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 animate-pulse">
        <Building2 className="w-4 h-4" />
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  if (!currentCompany || companies.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between rounded-xl border-muted hover:bg-muted/50"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-semibold text-sm truncate">
                {currentCompany.name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {currentCompany.plan_status}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[280px] rounded-2xl p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide px-2">
          Mis Empresas ({companies.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className={cn(
              "rounded-xl p-3 cursor-pointer",
              currentCompany.id === company.id && "bg-muted"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  currentCompany.id === company.id
                    ? "bg-gradient-to-br from-primary to-accent"
                    : "bg-muted"
                )}
              >
                <Building2
                  className={cn(
                    "w-4 h-4",
                    currentCompany.id === company.id
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{company.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs rounded-full",
                      company.plan_status === "active" &&
                        "bg-green-100 text-green-700 border-green-200",
                      company.plan_status === "trial" &&
                        "bg-blue-100 text-blue-700 border-blue-200",
                      company.plan_status === "suspended" &&
                        "bg-orange-100 text-orange-700 border-orange-200"
                    )}
                  >
                    {company.plan_status}
                  </Badge>
                </div>
              </div>
              {currentCompany.id === company.id && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          <span>Nueva Empresa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
</file_contents>
