

document.addEventListener('DOMContentLoaded', function () {
    const FILENAME = ENDPOINT?.replaceAll(/[^\w]/g, '_') + '.csv';
    let collection = urlSearchParams.get('collection')?.trim('/')

    if (PLATFORM == platform_fix.shopbase) {
        collection = urlSearchParams.get('collection_ids')?.trim('/');
    } else if (PLATFORM == platform_fix.shopify) {
        collection = urlSearchParams.get('collection')?.trim('/')
    } else if (PLATFORM == platform_fix.wordpress) {
    }

    new Vue({
        el: '#app',
        data: {
            products: [],
            limitPerPage: 20,
            page: 1,
            search: '',
            url: ENDPOINT,
            platform: PLATFORM,
            loading: false,
            user: {},
            collection: collection,
        },
        async created() {
            try {
                await this.loadProducts()
            } catch (e) {
            }
        },
        mounted() {
            var elems = document.querySelectorAll('.modal');
            M.Modal.init(elems, {});
        },
        computed: {
            exportButtonTitle() {
                const c = this.selectedProducts().length;
                return c > 0 ? 'EXPORT (' + c + ')' : 'EXPORT ALL'
            },
            selectedOrAllProducts() {
                const selectedProducts = this.selectedProducts();
                return selectedProducts.length > 0 ? selectedProducts : this.products;
            }
        },
        methods: {
            /**
             * Load Product from shopify
             *
             * @return {Promise<void>}
             */
            async loadProducts() {
                let page = 1;
                let next = true, url = "";

                if (PLATFORM == platform_fix.shopbase) {
                    if (collection && collection.length > 0) {
                        url = ENDPOINT + '/api/catalog/next/products.json?sort_field=created&collection_ids=' + collection + '&limit=250&page=';
                    } else {
                        url = ENDPOINT + '/api/catalog/next/products.json?sort_field=created&limit=250&page=';
                    }
                } else if (PLATFORM == platform_fix.shopify) {
                    if (collection && collection.length > 0) {
                        url = ENDPOINT + '/collections/' + collection + '/products.json?limit=250&page=';
                    } else {
                        url = ENDPOINT + '/products.json?limit=250&page=';
                    }
                } else if (PLATFORM == platform_fix.wordpress) {
                }

                this.products = [];
                this.loading = true;

                while (next) {
                    next = false;
                    try {
                        let response = await fetch(url + page).then(response => response.json())
                        if (PLATFORM == platform_fix.shopbase) {
                            if (response?.result?.items?.length) {
                                this.products = [...this.products, ...response.result.items.map(p => {
                                    p.checked = false;
                                    p.created_at_show = (new Date(p.created_at * 1000)).toLocaleString();
                                    return p;
                                })];
                                next = true;
                                page++;
                            }
                        } else if (PLATFORM == platform_fix.shopify) {
                            if (response?.products?.length) {
                                this.products = [...this.products, ...response.products.map(p => {
                                    p.checked = false;
                                    p.created_at_show = (new Date(p.created_at)).toLocaleString();
                                    return p;
                                })];
                                next = true;
                                page++;
                            }
                        } else if (PLATFORM == platform_fix.wordpress) {
                        }

                        if (page > 60) next = false; // fix 15k sp

                    } catch (e) {
                    }
                }

                this.loading = false;
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
             * Get current pagination
             *
             * @return {any[]}
             */
            pagination() {
                return this.paginationFilter().splice((this.getPage() - 1) * this.limitPerPage, this.limitPerPage)
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
             * Filter pagination
             *
             * @return {*[]}
             */
            paginationFilter() {
                return this.products
                    .slice()
                    .filter(product => {
                        return this.search.length < 2 || (product.title.match(
                            new RegExp('.*' + this.search + '.*', 'gi')
                        ))
                    })
            },
            selectedProducts() {
                return this.products.filter(product => product.checked)
            },
            /**
             * Export products to csv
             *
             * @param products
             * @param {boolean} control
             * @return {Promise<void>}
             */
            async processExportProducts(products, control = true) {
                this.loading = true;
                await this.downloadProducts(products)
                this.loading = false;
            },
            /**
             * Export one product to csv
             *
             * @param product
             * @return {Promise<void>}
             */
            async processExportProduct(product) {
                await this.processExportProducts([product], true);
            },

            getCatalogProduct() {
                return fetch("\\product_catalog.json", { mode: "no-cors" }) // disable CORS because path does not contain http(s)
                    .then((res) => res.json())
                    .then((data) => {
                        return data;
                    });
            },
            /**
             *
             * Download product to csv
             *
             * @param products
             * @return {Promise<void>}
             */
             async downloadProducts(products) {
                const values = [];
                var productCatalog = await this.getCatalogProduct();
                var productTypeFix = document.getElementById('productType');

                for await (let product of products) {
                    await Service.productToCsvObject(product, values, productCatalog, productTypeFix.value)
                }

                if (products.length > 0) {
                    const content = (new CSV()).convert(values);
                    (new Export()).csv(content, FILENAME);
                    M.toast({ html: '✅ Export success !!!' });
                } else {
                    M.toast({ html: '❌ Export fail !!!' });
                }
            },
            selectedAllProductsFilter() {
                var productFilter = this.products.slice().filter(product => {
                    return this.search.length < 1 || (product.title.match(
                        new RegExp('.*' + this.search + '.*', 'gi')
                    ))
                });
                if (this.products.length > 0) {
                    const productFilterSelected = this.products.slice().filter(product => {
                        return this.search.length < 1 || (product.title.match(
                            new RegExp('.*' + this.search + '.*', 'gi')
                        ))
                    }).filter(product => product.checked === true);

                    if (productFilterSelected.length >= productFilter.length) { // reset all
                        this.products
                            .slice()
                            .map(product => {
                                product.checked = false;
                            });
                        //} else if (productFilterSelected.length > 0 && productFilterSelected.length < productFilter) { // selected all
                    } else {
                        this.products.slice().filter(product => {
                            return this.search.length < 1 || (product.title.match(
                                new RegExp('.*' + this.search + '.*', 'gi')
                            ))
                        }).map(product => {
                            product.checked = true;
                        });
                    }
                }
            },
            /**
             * Reset all product
             */
            reset() {
                for (const product of this.products) {
                    product.checked = false
                }
            }
        }
    });
});