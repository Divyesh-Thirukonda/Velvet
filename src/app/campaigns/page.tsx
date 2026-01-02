import { Mail, TrendingUp, Users, Activity } from 'lucide-react';
import { getRecentKlaviyoEvents } from '@/lib/klaviyo';
import { formatDistanceToNow } from 'date-fns';

export default async function CampaignsPage() {
    // Fetch Real Data
    const genEvents = await getRecentKlaviyoEvents('Generated 3D Model');

    // Calculate Stats
    const totalGenerated = genEvents.length;
    // We can't really know "emails sent" or "recovery rate" without more complex queries or mock-logic on top of real event counts.
    // For now, we'll derive some reasonable stats or just show the real event count as the primary star.

    // Mocking derived stats for now (as we can't fetch email open rates easily without more permissions/time)
    // But "Generated 3D Model" is REAL.
    const recoveryRate = 'N/A';

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Klaviyo <span className="text-primary">Intelligence</span></h1>
                <p className="text-muted-foreground text-lg">Real-time view of triggered flows based on 3D generation events.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Users, label: '3D Models Generated (Real-time)', value: totalGenerated.toString(), color: 'text-blue-400' },
                    { icon: Mail, label: 'Flows Triggered', value: totalGenerated.toString(), color: 'text-primary' },
                    { icon: TrendingUp, label: 'Recovery Rate (Est)', value: recoveryRate, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 flex flex-col gap-4">
                        <div className={`p-3 bg-white/5 w-fit rounded-lg ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Live Event Stream (Generated 3D Model)</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                    </div>
                </div>

                <div className="space-y-1">
                    {genEvents.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No events found yet. Generate a model to see it here!</div>
                    ) : (
                        genEvents.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Generated 3D Model</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.email} • {item.properties?.ProductName || 'Unknown Product'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
