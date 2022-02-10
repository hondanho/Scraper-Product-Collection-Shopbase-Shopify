Vue.component('nav-component', {
    props: ['title', 'user', 'url', 'platform'],
    template: `
        <div>
            <nav class="light-blue darken-4">
                <div class="nav-wrapper">
                  <a href="" class="brand-logo"><i class="material-icons">star</i>{{title}}</a>
                  <ul class="right hide-on-med-and-down">
                    <li><a :href="'collections.html?url=' + url + '&platform=' + platform" title="go to collections"><i class="material-icons right">list</i>Collections</a></li>
                    <li><a :href="'products.html?url=' + url+ '&platform=' + platform" title="go to products"><i class="material-icons right">loyalty</i>Products</a></li>
                  </ul>
                </div>
            </nav>
        </div>
    `,
    methods: {
    }
});