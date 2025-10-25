// ======= Global cart =======
let cart = [];

// ======= Select Elements =======
const cartDrawer = document.getElementById("cart-drawer");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const closeCart = document.getElementById("close-cart");
const cartIcon = document.getElementById("cart-icon");

// ======= Open/Close Cart =======
cartIcon.addEventListener("click", () => {
  cartDrawer.style.right = "0";
});

closeCart.addEventListener("click", () => {
  cartDrawer.style.right = "-400px";
});

// ======= Add to Cart Buttons =======
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    const isCustom = form.dataset.custom === "true";

    // Signature or Custom Foods
    if (form.id.includes("Bowl") || form.id.includes("Pita")) {
      if (isCustom) {
        if (!validateCustom(form.id)) return;
        addCustomItem(form);
      } else {
        addSignatureItem(form);
      }
    }

    // Drinks
    else if (form.id === "drinksForm") {
      addDrinks(form);
    }

    updateCart();
  });
});

// ======= Validation for Custom Bowls/Pitas =======
function validateCustom(formId) {
  const form = document.getElementById(formId);
  const requiredFields = ["base", "protein", "dressing"];
  for (const name of requiredFields) {
    const checked = [...form.querySelectorAll(`input[name="${name}"]:checked`)];
    if (checked.length === 0) {
      alert(`Please select at least one ${name}.`);
      return false;
    }
  }
  return true;
}

// ======= Add Custom Bowl/Pita =======
function addCustomItem(form) {
  const type = form.id.includes("Bowl") ? "Custom Bowl" : "Custom Pita";
  const base = getCheckedValues(form, "base");
  const protein = getCheckedValues(form, "protein");
  const spreads = getCheckedValues(form, "spread");
  const toppings = getCheckedValues(form, "topping");
  const dressings = getCheckedValues(form, "dressing");

  const customEntry = {
    name: type,
    base,
    protein,
    spreads,
    toppings,
    dressings,
    quantity: 1,
    type: "custom",
  };
  cart.push(customEntry);
}

// ======= Add Signature Bowls/Pitas =======
function addSignatureItem(form) {
  const fieldsets = form.querySelectorAll("fieldset");
  fieldsets.forEach(set => {
    const name = set.querySelector("legend").textContent;
    const toppings = [...set.querySelectorAll("input[type='checkbox']:checked")].map(cb => cb.value);
    const entry = {
      name,
      toppings,
      removedToppings: [],
      quantity: 1,
      type: "signature",
    };
    cart.push(entry);
  });
}

// ======= Add Drinks =======
function addDrinks(form) {
  const fieldsets = form.querySelectorAll("fieldset");
  fieldsets.forEach(set => {
    const drinkName = set.querySelector("legend").textContent;
    const selectedSize = [...set.querySelectorAll("input[type='checkbox']:checked")].map(cb => cb.value);
    selectedSize.forEach(size => {
      const entry = {
        name: drinkName,
        size,
        quantity: 1,
        type: "drink",
      };
      cart.push(entry);
    });
  });
}

// ======= Helper: Get Checked Values =======
function getCheckedValues(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

// ======= Update Cart =======
function updateCart() {
  cartItems.innerHTML = "";
  cartCount.textContent = cart.length;

  cart.forEach((entry, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-entry");

    if (entry.type === "drink") {
      div.innerHTML = `
        <strong>${entry.name} (${entry.size})</strong>
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
      `;
    } else {
      div.innerHTML = `
        <strong>${entry.name}</strong>
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
      `;
    }

    div.querySelector(".edit-btn").addEventListener("click", () => openEditForm(index));
    div.querySelector(".remove-btn").addEventListener("click", () => {
      cart.splice(index, 1);
      updateCart();
    });

    cartItems.appendChild(div);
  });
}

// ======= Open Edit Form =======
function openEditForm(index) {
  const entry = cart[index];
  const container = cartItems.children[index];
  container.innerHTML = `<strong>${entry.name} (x${entry.quantity})</strong>`;

  // ======= Drinks Editing =======
  if (entry.type === "drink") {
    const formDiv = document.createElement("div");
    formDiv.classList.add("edit-form");

    const sizes = ["small", "large"];
    sizes.forEach(size => {
      const rb = document.createElement("input");
      rb.type = "radio";
      rb.name = "size";
      rb.value = size;
      rb.checked = entry.size === size;
      const label = document.createElement("label");
      label.textContent = size.charAt(0).toUpperCase() + size.slice(1);
      label.prepend(rb);
      formDiv.appendChild(label);
      formDiv.appendChild(document.createElement("br"));
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("save-btn");
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");

    saveBtn.addEventListener("click", () => {
      const newSize = formDiv.querySelector("input[name=size]:checked")?.value;
      if (newSize) entry.size = newSize;
      updateCart();
    });
    cancelBtn.addEventListener("click", () => updateCart());

    formDiv.appendChild(saveBtn);
    formDiv.appendChild(cancelBtn);
    container.appendChild(formDiv);
    return;
  }

  // ======= Custom Bowl/Pita Editing =======
  if (entry.type === "custom") {
    const formDiv = document.createElement("div");
    formDiv.classList.add("edit-form");

    const categories = {
      base: ["Brown Rice", "SuperGreens", "Lentils", "RightRice", "Pita"],
      protein: ["Grilled Chicken", "Falafel", "Braised Lamb", "Roasted Veggies"],
      spreads: ["Hummus", "Crazy Feta", "Roasted Red Pepper Hummus", "Tzatziki"],
      toppings: ["Pickled Onions", "Cabbage Slaw", "Avocado", "Kalamata Olives", "Tomato + Cucumber"],
      dressings: ["Greek Vinaigrette", "Lemon Herb Tahini", "Harissa", "Yogurt Dill"]
    };

    for (const [category, options] of Object.entries(categories)) {
      const heading = document.createElement("h4");
      heading.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      formDiv.appendChild(heading);

      options.forEach(opt => {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = opt;
        cb.name = category;
        cb.checked = entry[category]?.includes(opt);
        const label = document.createElement("label");
        label.textContent = opt;
        label.prepend(cb);
        formDiv.appendChild(label);
        formDiv.appendChild(document.createElement("br"));
      });
    }

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("save-btn");
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");

    saveBtn.addEventListener("click", () => {
      for (const category of Object.keys(categories)) {
        entry[category] = [...formDiv.querySelectorAll(`input[name="${category}"]:checked`)].map(cb => cb.value);
      }
      updateCart();
    });
    cancelBtn.addEventListener("click", () => updateCart());

    formDiv.appendChild(saveBtn);
    formDiv.appendChild(cancelBtn);
    container.appendChild(formDiv);
    return;
  }

  // ======= Signature Bowl/Pita Editing =======
  if (entry.type === "signature") {
    const formDiv = document.createElement("div");
    formDiv.classList.add("edit-form");

    const toppings = entry.toppings?.length
      ? entry.toppings
      : ["Tomato + Onion", "Pickled Onions", "Avocado", "Greens", "Feta", "Kalamata Olives"];

    toppings.forEach(topping => {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = topping;
      cb.checked = !entry.removedToppings.includes(topping);
      const label = document.createElement("label");
      label.textContent = topping;
      label.prepend(cb);
      formDiv.appendChild(label);
      formDiv.appendChild(document.createElement("br"));
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("save-btn");
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("cancel-btn");

    saveBtn.addEventListener("click", () => {
      const newRemoved = [...formDiv.querySelectorAll("input[type=checkbox]")].filter(cb => !cb.checked).map(cb => cb.value);
      entry.removedToppings = newRemoved;
      updateCart();
    });
    cancelBtn.addEventListener("click", () => updateCart());

    formDiv.appendChild(saveBtn);
    formDiv.appendChild(cancelBtn);
    container.appendChild(formDiv);
  }
}
