let btn: HTMLElement | null = document.getElementById("submitValue");
btn!.addEventListener("click", (e:Event) => {
    AddDataToLinkedList();
});
function AddDataToLinkedList() {
    let data: string = (<HTMLInputElement>document.getElementById("LinkedListValue")).value;
    if( data.trim() === "")
    {
        alert("Please First enter a value");
        return;
    }
    let list : HTMLElement | null = document.getElementById('LinkedList');
    var element = document.createElement("span"); 
    if(list?.childElementCount!=0)
    {
        data="->"+data;
    }
    element.innerText=data+"";
    list?.appendChild(element); 
    (<HTMLInputElement>document.getElementById("LinkedListValue")).value="";
}
