export function isRailwayPrEnvironment(_environmentName: string | undefined): boolean {
    return /(?:^|-)pr-\d+$/i.test(_environmentName?.trim() ?? "");
}
