
class Export {
    /**
     * Download url
     *
     * @param {string} url
     * @param {string} filename
     */
    downloadUrl(url, filename) {
        const anchorElement = document.createElement('a');

        anchorElement.href = url;
        anchorElement.download = filename;
        anchorElement.click();
    }

    /**
     * Download csv
     *
     * @param {string} content
     * @param {string} filename
     */
    csv(content, filename) {
        const blob = new Blob([content], {type: 'text/csv'});

        this.downloadUrl(URL.createObjectURL(blob), filename)
    }
}