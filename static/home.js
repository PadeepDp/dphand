
let cart = document.querySelector('#cartCounter')

let add = document.querySelectorAll('.add-to-cart')

function updateCart(products){
    axios.post('/update-cart',products).then(res=>{
        cart.innerHTML = res.data.totalQty
    })
}


add.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let products = JSON.parse(btn.dataset.products)
        updateCart(products)
    })
})