let branch_name = document.querySelector('#branch_name');
let test_id = document.querySelector('#test_id');
branch_name.addEventListener('change', () => {
    axios.get('/branchTests', {
        params: { branch_name: branch_name.value }
    })
    .then((response) => {
        const allTests = response.data;
        test_id.innerHTML = "<option value='' disabled>Select Test</option>";
        allTests.forEach((opt) => {
        const new_option = document.createElement("option");
        new_option.value = opt._id;
        new_option.textContent = opt.testName;
        test_id.appendChild(new_option);
    })
    })
    .catch((err) => {
        console.log('error received: ', err);  
    })
})