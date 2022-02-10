Vue.component('product-modal', {
    props: ["product", "modalId"],
    data() {
        return {
            showDescription: false
        }
    },
    template: `
      <div class="modal modal-fixed-footer" :id="modalId">
        <div class="modal-content">
        <h4>Overview of your product</h4>
        <table style="table-layout: fixed">
            <tbody>
                <tr>
                    <th class="vertical-align-top">Title</th>
                    <td v-html="product.title"></td>
                </tr>
                <tr>
                    <th class="vertical-align-top">Description</th>
                    <td style="overflow: auto;">
                        <button type="button" class="btn right" v-on:click="showDescription = !showDescription">
                             <i class="material-icons" v-if="showDescription">visibility</i>
                             <i class="material-icons" v-if="!showDescription">visibility_off</i>
                        </button>
                        
                        <div v-if="showDescription" v-html="normalizeHtml(product.body_html)"></div>
                    </td>
                </tr> 
                <tr>
                    <th class="vertical-align-top">Type</th>
                    <td>{{product.product_type}}</td>
                </tr>
                <tr>
                    <th class="vertical-align-top">Vendor</th>
                    <td>{{product.vendor}}</td>
                </tr>
            </tbody>
        </table>
 
        <table class="striped" style="table-layout: fixed">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Variant</th>
                    <th>Sku</th>
                    <th>Price</th>
                    <th>Compare</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="variant, index in product.variants">
                    <td><img :src="variantImage(product, variant, index)" :alt="variant.title" width="80" height="80"></td>
                    <td>{{ variant.title }}</td>
                    <td>{{ variant.sku }}</td>
                    <td>
                        {{variant.price}}
                    </td>
                    <td>
                        <del>{{variant.compare_at_price}}</del>
                    </td>
                </tr>
            </tbody>
        </table>
</div>
        <div class="modal-footer">
          <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
        </div>
      </div>
    `,
    mounted() {
        let element = document.getElementById(this.modalId);
        if (element && M?.Modal) {
            M.Modal.init(element, {})
        }
    },
    methods:{
        normalizeHtml(html) {
            return html.replace(/src="\/\//gi, 'src="https://')
        },
        variantImage(product, variant, index) {
            if (variant?.featured_image?.src) {
                return variant?.featured_image?.src;
            }

            if (product?.featured_image) {
                return product?.featured_image;
            }

            return product?.images[index]?.src
        }
    }
})