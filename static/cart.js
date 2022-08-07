let remove = document.querySelectorAll('.cart-remove-item')

function modifyCart(products){
    axios.post('/modify-cart',products).then(res=>{
        console.log(res)
        if (res.data.redirect == '/') {
            window.location = "/cart"
        }
    })
}

remove.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        console.log(e)
        let products = JSON.parse(btn.dataset.products)
        console.log(products)
        modifyCart(products)
    })
})