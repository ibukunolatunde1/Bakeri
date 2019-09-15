const deleteSupplier = btn => {
    const supplierId = btn.parentNode.querySelector('[name=supplierId]').value;
    console.log(supplierId);

    const targetElement = btn.closest('.supplier--container');
    console.log(targetElement);

    fetch(`/admin/supplier/${supplierId}`, {
        method: 'DELETE',
    })
    .then(result => {
        return result.json(); 
    })
    .then(data => {
        console.log(data);
        targetElement.parentNode.removeChild(targetElement);
    })
    .catch(err => console.log(err));
}