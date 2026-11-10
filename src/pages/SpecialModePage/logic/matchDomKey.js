export const matchDomKey = (match) =>
    match ? `${match.id ?? ""}|${[match.slotA?.id ?? "", match.slotB?.id ?? ""].map(String).sort().join("-")}` : undefined;
