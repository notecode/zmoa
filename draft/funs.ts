let metaDataSites: { [key: string]: string } = (`$$SITES` as any);

let siteMap = (function (sites) {
    let map = {};
    for (let domain in sites) {
        let folder = sites[domain];
        if (folder) {
            map[folder] = domain;
        }
    }
    return map;
})(metaDataSites)

export function moduleToUrl(id: string): string {
    for (let folder in siteMap) {
        if (id.startsWith(folder)) {
            return siteMap[folder] + id.replace(folder, '') + '?__rq__=amd';
        }
    }
    return '';
}
