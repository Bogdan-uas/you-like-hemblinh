export const TOURNAMENT_TIERS = {
    official: { badge: "OF", label: "Official", color: "#000000" },
    tier1: { badge: "T1", label: "Tier 1", color: "#e01b24" },
    tier2: { badge: "T2", label: "Tier 2", color: "#f5c400", textColor: "#2e2f42" },
    qualifier: { badge: "Q", label: "Qualifier", color: "#cccccc", textColor: "#2e2f42" },
};

export const TOURNAMENT_TIER_EXPLANATIONS = [
    { tier: "official", text: <>The biggest tournament. The winner gets an Official trophy, 2nd and 3rd place get 🥈 and 🥉.</> },
    { tier: "tier1", text: <>A big tournament, like the main event of the PEM Small or PEM Big Tournament, the Global Pro League or the Premier Bounty Series. The winner gets that tournament's own Tier 1 trophy, 2nd and 3rd place count into the 🥈 and 🥉 totals.</> },
    { tier: "tier2", text: <>A smaller tournament, like the Champions Series Tour, the Elite Competition League or the Global Challenger Cup. The winner gets a 🥇, 2nd and 3rd place count into the 🥈 and 🥉 totals.</> },
    { tier: "qualifier", text: <>A qualifier for a bigger tournament. It gives no medals: its best teams qualify to the event it belongs to.</> },
];

export const CARET_LEFT_PATH =
    "M199.7 299.8C189.4 312.4 190.2 330.9 201.9 342.6L329.9 470.6C339.1 479.8 352.8 482.5 364.8 477.5C376.8 472.5 384.6 460.9 384.6 447.9L384.6 191.9C384.6 179 376.8 167.3 364.8 162.3C352.8 157.3 339.1 160.1 329.9 169.2L201.9 297.2L199.7 299.6z";
