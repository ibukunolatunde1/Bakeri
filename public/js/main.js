const suppliers = document.getElementsByClassName('supplier--container');
const backdrop = document.querySelector('.backdrop');

// console.log(supplier);

// Object.entries(supplier).map(object => console.log(object));

// console.log(Array.from(supplier));


const backdropClickHandler = () => {
    console.log('Clicked on backdrop');
    backdrop.style.display = 'none';
}

const viewSupplierHandler = () => {
    backdrop.style.display = 'block';
}

// supplier.addEventListener('click', viewSupplierHandler);
backdrop.addEventListener('click', backdropClickHandler);
Array.from(suppliers).forEach(supplier => {
    supplier.addEventListener('click', viewSupplierHandler);
});