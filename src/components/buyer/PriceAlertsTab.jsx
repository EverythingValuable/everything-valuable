import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusLabels = {
  active: { label: "Active", color: "bg-blue-50 text-blue-700 border-blue-200" },
  triggered: { label: "Triggered", color: "bg-green-50 text-green-700 border-green-200" },
};

export default function PriceAlertsTab({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ["price-alerts", userEmail],
    queryFn: () => base44.entities.PriceAlert.filter({ user_email: userEmail }, "-created_date", 50),
    enabled: !!userEmail,
    initialData: [],
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.PriceAlert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });

  const { data: itemsMap = {} } = useQuery({
    queryKey: ["alert-items", alerts.map(a => a.item_id).join(",")],
    queryFn: async () => {
      const uniqueIds = [...new Set(alerts.map(a => a.item_id))];
      const results = await Promise.all(
        uniqueIds.map(id =>
          base44.entities.Item.filter({ id }).then(r => r[0]).catch(() => null)
        )
      );
      return Object.fromEntries(
        results.filter(Boolean).map(item => [item.id, item])
      );
    },
    enabled: alerts.length > 0,
  });

  const activeAlerts = alerts.filter(a => a.status === "active");
  const triggeredAlerts = alerts.filter(a => a.status === "triggered");

  if (alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-14 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-serif text-xl text-muted-foreground">No price alerts yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Set alerts on items to get notified when prices drop.</p>
          <Link to="/browse" className="text-sm text-primary font-medium mt-3 inline-block hover:underline">Browse Items →</Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeAlerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Active Alerts</p>
          <div className="space-y-3">
            {activeAlerts.map(alert => {
              const item = itemsMap[alert.item_id];
              return (
                <Card key={alert.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      {item?.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={alert.item_title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/item/${alert.item_id}`} className="font-serif text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                          {alert.item_title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={statusLabels.active.color}>
                            {statusLabels.active.label}
                          </Badge>
                          {item?.status === "first_bids" && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">1stBid$™</Badge>
                          )}
                          {item?.status === "prisometer" && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">PRI$OMETER™</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Target: <span className="font-semibold text-foreground">${alert.target_price.toLocaleString("en-US")}</span>
                          </span>
                        </div>
                        {item?.current_price && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Current: ${item.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            {item.current_price <= alert.target_price && (
                              <span className="text-green-600 ml-1 font-medium">✓ Target reached!</span>
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">Triggered Alerts</p>
          <div className="space-y-3">
            {triggeredAlerts.map(alert => {
              const item = itemsMap[alert.item_id];
              return (
                <Card key={alert.id} className="overflow-hidden opacity-70">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      {item?.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={alert.item_title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/item/${alert.item_id}`} className="font-serif text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                          {alert.item_title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={statusLabels.triggered.color}>
                            <Check className="w-3 h-3 mr-1" />
                            {statusLabels.triggered.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.trigger_reason === "first_bids_started" ? "1stBid$ started" : "Price target reached"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}