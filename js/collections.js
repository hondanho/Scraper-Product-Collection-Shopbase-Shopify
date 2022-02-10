
window.addEventListener('DOMContentLoaded', function () {
    const FILENAME = ENDPOINT?.replaceAll(/[^\w]/g, '_') + '.csv';

    new Vue({
        el: '#app',
        data: {
            collections: [],
            collectionsExportedProducts: {},
            limitPerPage: 20,
            page: 1,
            search: '',
            url: ENDPOINT,
            loading: false,
            user: {},
            platform: PLATFORM,
            progress: {
                loading: false,
                collection: '',
                progressCollections: 0,
                totalCollections: 0,
                totalProducts: 0,
            },
        },
        async created() {
            this.loading = true
            try {
                await this.loadCollections()
            } catch (e) {
            }

            this.loading = false
        },
        mounted() {
            var elems = document.querySelectorAll('.modal');
            M.Modal.init(elems, {});
        },
        computed: {
            exportButtonTitle() {
                const c = this.selectedCollections().length;
                return c > 0 ? 'EXPORT (' + c + ')' : 'EXPORT ALL'
            },
            selectedOrAllCollections() {
                const selectedCollections = this.selectedCollections();
                return selectedCollections.length > 0 ? selectedCollections : this.collections;
            }
        },
        methods: {
            /**
             * Load collection from Shopify
             *
             * @return {Promise<void>}
             */
            async loadCollections() {
                let page = 1;
                let next = true;

                let url = "";
                if (PLATFORM == platform_fix.shopbase) {
                    url = ENDPOINT + '/api/catalog/next/collections.json?limit=250&page=';
                } else if (PLATFORM == platform_fix.shopify) {
                    url = ENDPOINT + '/collections.json?limit=250&page=';
                } else if (PLATFORM == platform_fix.wordpress) {
                }

                if (url) {
                    while (next) {
                        next = false;
                        try {
                            let response = await fetch(url + page).then(response => response.json())

                            if (PLATFORM == platform_fix.shopbase) {
                                if (response?.result?.items?.length) {
                                    this.collections = [...this.collections, ...response.result.items.map(c => {
                                        c.checked = false;
                                        return c
                                    })]
                                    next = true;
                                    page++;
                                }
                            } else if (PLATFORM == platform_fix.shopify) {
                                if (response?.collections?.length) {
                                    this.collections = [...this.collections, ...response.collections.map(c => {
                                        c.checked = false;
                                        return c
                                    })]
                                    next = true;
                                    page++;
                                }
                            } else if (PLATFORM == platform_fix.wordpress) {
                            }

                        } catch (e) {
                        }
                    }
                }
            },
            /**
             * Check if page is active
             *
             * @param page
             * @return {boolean}
             */
            isActivePage(page) {
                return page === this.getPage()
            },
            /**
             * Count pagination page
             *
             * @return {number}
             */
            pageCount() {
                return Math.ceil(this.paginationFilter().length / this.limitPerPage)
            },
            /**
             * Page range
             *
             * @return {[]}
             */
            pageRange() {
                const page = this.getPage()
                const start = Math.max(1, page - 5);
                const end = Math.min(this.pageCount(), page + 5);
                const range = [];

                for (let i = start; i <= end; i++) {
                    range.push(i);
                }

                return range;
            },
            setPage(page) {
                this.page = Math.min(this.pageCount(), page)
            },
            getPage() {
                return Math.min(this.pageCount(), this.page)
            },
            /**
             * set current pagination to previous
             */
            previousPage() {
                this.page = Math.max(1, this.getPage() - 1);
            },

            /**
             * set current pagination to next
             */
            nextPage() {
                this.page = Math.min(this.getPage() + 1, this.pageCount());
            },
            /**
             *
             * Pagination of current page
             *
             * @return {*[]}
             */
            pagination() {
                return this.paginationFilter().splice((this.getPage() - 1) * this.limitPerPage, this.limitPerPage)
            },
            /**
             * Pagination filter
             *
             * @return {*[]}
             */
            paginationFilter() {
                return this.collections
                    .slice()
                    .filter(collection => {
                        return this.search.length < 2 || (collection.title.match(
                            new RegExp('.*' + this.search + '.*', 'gi')
                        ))
                    })
            },
            selectedCollections() {
                return this.collections.filter((collection) => collection.checked);
            },
            /**
             * Export list collection
             *
             * @param collections
             * @return {Promise<void>}
             */
            async processExportCollections(collections = []) {
                this.loading = true;
                this.progress.loading = true;
                let products = [];
                this.progress.progressCollections = 0;
                this.progress.totalCollections = collections.length;
                this.progress.totalProducts = 0;

                for (const collection of collections) {
                    this.progress.collection = collection.title
                    products = [...products, ...await this.getCollectionProducts(collection)]
                    this.progress.progressCollections += 1
                    this.progress.totalProducts = products.length
                }
                await this.downloadProducts(products)

                this.loading = false;
                this.progress.loading = false;
            },
            /**
             * Export collection
             *
             * @param collection
             * @return {Promise<void>}
             */
            async processExportCollection(collection) {
                await this.processExportCollections([collection])
            },
            /**
             * Get collection products
             *
             * @param collection
             * @return {Promise<[]|*>}
             */
            async getCollectionProducts(collection) {
                if (this.collectionsExportedProducts[collection.handle]) {
                    return this.collectionsExportedProducts[collection.handle]
                }

                let page = 1;
                let next = true;
                let products = [];

                let url = "";
                if (PLATFORM == platform_fix.shopbase) {
                    url = ENDPOINT + '/api/catalog/next/products.json?sort_field=created&collection_ids=' + collection.id + '&limit=250&page=';
                } else if (PLATFORM == platform_fix.shopify) {
                    url = ENDPOINT + '/collections/' + collection.handle + '/products.json?limit=250&page=';
                } else if (PLATFORM == platform_fix.wordpress) {
                }


                while (next) {
                    next = false;
                    try {
                        let response = await fetch(url + page).then(response => response.json())

                        if (PLATFORM == platform_fix.shopbase) {
                            if (response?.result?.items?.length) {
                                products = [...products, ...response.result.items.map(p => {
                                    p.collection = collection.handle
                                    return p;
                                })]
                                next = true;
                                page++;
                            }
                        } else if (PLATFORM == platform_fix.shopify) {
                            if (response?.products?.length) {
                                products = [...products, ...response.products.map(p => {
                                    p.collection = collection.handle
                                    return p;
                                })]
                                next = true;
                                page++;
                            }
                        } else if (PLATFORM == platform_fix.wordpress) {
                        }


                    } catch (e) {
                    }
                }

                this.collectionsExportedProducts[collection.handle] = products

                return products
            },
            /**
             * Download products
             *
             * @param products
             * @return {Promise<void>}
             */
            async downloadProducts(products) {
                const values = [];
                var productType = document.getElementById('productType');

                for (const product of products) {
                    Service.productToCsvObject(product, values, productType)
                }

                if (products.length > 0) {
                    const content = (new CSV()).convert(values);
                    (new Export()).csv(content, FILENAME);
                    M.toast({ html: '✅ Export success !!!' });
                } else {
                    M.toast({ html: '❌ Export fail !!!' });
                }
            },
            /**
             * Show product page
             *
             * @param collection
             */
            showProductPage(collection) {
                window.open(
                    "products.html?url=" + ENDPOINT + '&platform=' + PLATFORM + '&collection=' + collection.handle,
                    '_blank'
                );
            },
            reset() {
                for (const collection of this.collections) {
                    collection.checked = false
                }
            }
        }
    });
});