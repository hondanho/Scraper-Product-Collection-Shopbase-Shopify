const platform_fix = {
    shopbase: 'shopbase',
    shopify: 'shopify',
    wordpress: 'wordpress'
};
const urlSearchParams = new URLSearchParams(location.search)
const PLATFORM = urlSearchParams?.get('platform')?.trim('/'); // wordpress, shopify, shopbase
const ENDPOINT = urlSearchParams?.get('url')?.trim('/');

window.addEventListener('DOMContentLoaded', (event) => {
    const urlSearchParams = new URLSearchParams(location.search)

    var checkExist = setInterval(function () {
        if (document.querySelector("nav.light-blue.darken-4")) {
            if (PLATFORM == platform_fix.shopbase) {
                document.querySelector("nav.light-blue.darken-4").style.setProperty("background-color", "#01579b", "important")
            } else if (PLATFORM == platform_fix.shopify) {
                document.querySelector("nav.light-blue.darken-4").style.setProperty("background-color", "#95bf46", "important")
            } else if (PLATFORM == platform_fix.wordpress) {
            }
        }
    }, 100);
});


class CSV {
    /**
     * Normalize string to csv format
     *
     * @param string
     * @return {string}
     */
    normalize(string) {
        string = string + "";
        string = string
            .replace(/"/g, '""')
            .replace(/(\n\r|\n)/g, " ")

        return '"' + string + '"';
    }

    /**
     * Convert object array to csv string
     *
     * @param {Array} data
     * @return {string}
     */
    convert(data) {

        if (!data?.length) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const lines = [];
        let line = [];

        for (const header of headers) {
            line.push(this.normalize(header ?? ''))
        }

        lines.push(line.join(','))

        for (const element of data) {
            line = [];
            for (const header of headers) {
                line.push(this.normalize(element[header] ?? ''))
            }
            lines.push(line.join(','))
        }

        return lines.join('\n');
    }
}