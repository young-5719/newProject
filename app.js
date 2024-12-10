// container.innerText="???" // defer 테스트

// project ()
// 1. 로그인 유저를 먼저 불러오기 (상품 리스트, 공휴일)
// 2. 그 유저와 관련된 데이터 불러오기(장바구니, 스케줄)

const loadData = async function (){
    let resArr = await Promise.all([
        fetch("./loginUser.json"),
        fetch("./products.json")
    ]);

/// map 방식
//[res,res].map((res)=>res.json()) => [res.json(),res.json()]
// let objArr=await Promise.all(resArr.map((res)=>res.json()));
// console.log(objArr);
    let objArr = await Promise.all([
        resArr[0].json(),
        resArr[1].json()
    ]);
    console.log(objArr);
    const loginUser = objArr[0];
    const products=objArr[1];
    // basket?user_id=djawls111; => djawls111Baskets.json
    let res3 = await fetch(`${loginUser["user_id"]}baskets.json`)
    let baskets=await res3.json()
    console.log(baskets);
    
}
loadData();








const basketCont = document.querySelector("#basketCont");
const totalPriceB = document.querySelector("#totalPriceB");
const loadBasketsBtn = document.querySelector("#loadBasketsBtn");
const basketEx = document.querySelector("#basketEx");
const basketForms = document.querySelectorAll(".basketForm");
let basketObj; // 화면이 로딩되면 ajax로 불러오는 장바구니 리스트

class BasketsObj {
    constructor(){
        this.total = 0; // 총 가격을 초기화
    }
    setBasket(basket) {
        if (basket.num in this) {
            alert("장바구니에 이미 존재합니다.")
        } else {
            this[basket.num] = basket;
            this.total += basket.total;  // 총 가격에 새로 추가된 상품의 총 가격을 더해줌
        }
    }
/////////////// 장바구니에서 상품을 삭제하는 메서드
    delBasket(num) {
        if (num in this) {
            this.total -= this[num].total; // 삭제된 상품의 총 가격만큼 빼 줌
            delete this[num];
        } else {
            alert("이미 삭제된 상품입니다.");
        }
    }
}



function Basket(form) {
    this.num = Number(form.num.value);  // 상품 고유번호
    this.price = Number(form.price.value); // 상품 가격
    this.cnt = Number(form.cnt.value); // 수량
    this.title = form.title.value;
    this.total = this.cnt * this.price;  // 가격 * 수량 = 총 가격
}

//장바구니에 물건이 담길 때 실행
const submitHandeler = function (e) {
    e.preventDefault();
    let basket = new Basket(this)  // this는 submitHandeler 함수가 호출 된 폼 요소를 참조, 즉 이 함수가 호출될 때 this는 submit 이벤트를 발생시킨 객체 즉 폼
    basketsObj.setBasket(basket)
    printBasketsObj();
}
    
// 장바구니를 출력하는 함수(화면이 로딩되면, 장바구니에 물건이 담길 때, 장바구니가 삭제될 때)
const printBasketsObj = () => {
    basketCont.innerHTML = "";  // 여러번 출력을 막기 위해 초기화
    for (let num in basketsObj) {
        if (isNaN(num)) continue;  // 숫자가 아닌 항목은 건너뜁니다.

        let basket = basketsObj[num];
        let tr = basketEx.cloneNode(true);  // basketEx 복사
        tr.removeAttribute("id");  // ID 제거

        for (let key in basket) {
            let td = tr.querySelector("." + key);  // 클래스에 맞는 요소 찾기
            td.append(document.createTextNode(basket[key]));  // 값 채우기
        }

        let delBtn = tr.querySelector(".delBtn");
        delBtn.dataset.num = basket.num;  // 삭제 버튼에 num 저장
        delBtn.onclick = (e) => {
            let delNum = e.target.dataset.num;
            basketsObj.delBasket(delNum);
            printBasketsObj();  // 삭제 후 업데이트
        };

        basketCont.append(tr);
    }

    // 전체 가격 갱신 (NaN 방지)
    totalPriceB.innerText = basketsObj.total || 0;
}


    // 비동기식으로 장바구니 내역을 받아오는 함수
    const loadBasketsFunc = () => { 
        const req = new XMLHttpRequest();
        req.open("GET", "./djawls111Baskets.json");
        req.send();
        req.onload = () => {
            if (req.status !== 200) {
                alert("요청 실패, 다시 시도");
                return;
            }
            // console.log(req.responseText); // 제이슨파일 텍스트를 표시해주는 지 체크
            basketsObj = JSON.parse(req.responseText); // {}의 프로토타입에 setBasket 함수를 정의
            Object.setPrototypeOf(basketsObj, BasketsObj.prototype)
            // console.log(basketObj);
    
            // basketObj.__proto__.setBasket=setBasket; // {} Object 오직 읽을 수만 있는 필드만 정의됨
    
    
            // console.log(basketsObj); // 잘 담겨줬는지 중간중에 체크 필요
            for (let num in basketsObj) { // for in 반복문을 사용하여 출력해줌
                // if (num === "total") continue;
                // break : 반복문 전체를 멈춤
                if (isNaN(num)) continue; //continue : 반복문의 해당 구문만 넘기는 것
                let basket = basketsObj[num];
                delete basketsObj[num];
                num = Number(num);
                basketsObj[num] = basket;
                // 정렬을 위해 key를 수로 바꾸는 중
            }
            printBasketsObj();
        }
    }
    loadBasketsBtn.onclick = loadBasketsFunc;

    const loadProductsBtn = document.getElementById("loadProductsBtn");
    const productList = document.getElementById("productList");
    const productEx = document.getElementById("productEx");
    const loadProducts = () => {
        const req = new XMLHttpRequest();
        req.open("GET", "./products.json");
        req.send();
        req.onload = () => {
            if (req.status !== 200) {
                alert("데이터 불러오기 실패, 다시 시도");
                return;
            }
            let products = JSON.parse(req.responseText);
            products.forEach((p) => {
                let ex = productEx.cloneNode(true);
                ex.removeAttribute("id");
                for (let key in p) {
                    let node = ex.querySelector("." + key);
                    let form = ex.querySelector(".basketForm");
                    if (key === "img[src]") {
                        node.src = p[key];
                    } else {
                        node?.append(document.createTextNode(p[key]))
                        form[key].value = p[key];
                    }
                    form.onsubmit = submitHandeler;
                }
                productList.append(ex);
            });
        }
    }
    loadProductsBtn.onclick = loadProducts;

    loadProducts();
    loadBasketsFunc();