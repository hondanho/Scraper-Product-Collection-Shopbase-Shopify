Vue.component('overlay-component', {
    props: ["loading", "message"],
    template: `
        <div class="overlay" v-if="loading">
            <div class="preloader-wrapper big active" style="margin-top: 22%">
                <div class="spinner-layer spinner-red-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
            <h4>{{ message?.length ? message : 'L O A D I N G . . .' }}</h4>
        </div>
    `
})