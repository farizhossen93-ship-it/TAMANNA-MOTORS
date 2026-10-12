import urllib.request
import urllib.parse
import http.cookiejar
import json
import re
import html
import os

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def strip_tags(text):
    if not text:
        return ""
    text = str(text)
    # Remove html tags
    clean = re.sub(r'<[^>]+>', ' ', text)
    # Decode html entities
    clean = html.unescape(clean)
    # Normalize whitespaces
    return " ".join(clean.split()).strip()

def extract_image_src(text):
    if not text:
        return ""
    m = re.search(r'src=["\']([^"\']+)["\']', str(text))
    return m.group(1) if m else ""

def clean_amount(text):
    if not text:
        return 0.0
    cleaned = strip_tags(text)
    # remove currency symbols, commas, etc.
    cleaned = re.sub(r'[^\d.-]', '', cleaned)
    try:
        return float(cleaned)
    except:
        return 0.0

print("1. Fetching login page...")
login_url = "https://hisabnikash.com/A-Pos/V5.0.2/public/login"
req = urllib.request.Request(login_url, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0"
})
resp = opener.open(req)
html_content = resp.read().decode("utf-8", errors="ignore")

csrf_match = re.search(r'name=["\']_token["\']\s+value=["\']([^"\']+)["\']', html_content)
token = csrf_match.group(1) if csrf_match else ""
print("CSRF Token:", token)

# 2. POST login
post_data = urllib.parse.urlencode({
    "_token": token,
    "username": "SAHIDUL",
    "password": "Tamanna2025"
}).encode("utf-8")

post_req = urllib.request.Request(login_url, data=post_data, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0",
    "Referer": login_url
})
opener.open(post_req)
print("Logged in successfully.")

def fetch_dt(endpoint, extra_params=""):
    url = f"https://hisabnikash.com/A-Pos/V5.0.2/public/{endpoint}?length=1000{extra_params}"
    r = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    })
    try:
        resp = opener.open(r)
        data = json.loads(resp.read().decode("utf-8", errors="ignore"))
        print(f"Fetched {endpoint}: {len(data.get('data', []))} items (Total: {data.get('recordsTotal', '?')})")
        return data.get('data', [])
    except Exception as e:
        print(f"Failed to fetch {endpoint}: {e}")
        return []

# Fetch all tables
products_raw = fetch_dt("products")
customers_raw = fetch_dt("contacts", "&type=customer")
suppliers_raw = fetch_dt("contacts", "&type=supplier")
sells_raw = fetch_dt("sells")
purchases_raw = fetch_dt("purchases")
expenses_raw = fetch_dt("expenses")

print("\nProcessing Products...")
processed_products = []
for p in products_raw:
    prod_name = strip_tags(p.get("product", ""))
    sku = strip_tags(p.get("sku", ""))
    cat = strip_tags(p.get("category", "")).strip() or "General Spare Parts"
    unit = strip_tags(p.get("unit", "")).strip() or "Pieces"
    brand = strip_tags(p.get("brand", "")).strip() or "Tamanna Motors"
    img = extract_image_src(p.get("image", ""))
    
    # Prices
    purchase_price = clean_amount(p.get("purchase_price", 0))
    selling_price = clean_amount(p.get("selling_price", 0))
    current_stock = clean_amount(p.get("current_stock", 0))

    if prod_name:
        processed_products.append({
            "id": f"prod-{p.get('id', len(processed_products) + 1)}",
            "name": prod_name,
            "sku": sku or f"TM-{len(processed_products)+100}",
            "category": cat,
            "businessLocation": "Hazigonj Branch",
            "unitPurchasePrice": purchase_price if purchase_price > 0 else (selling_price * 0.75 if selling_price > 0 else 100),
            "sellingPrice": selling_price if selling_price > 0 else 150,
            "currentStock": int(current_stock) if current_stock > 0 else 25,
            "alertQuantity": 5,
            "imageUrl": img or "",
            "createdAt": "2026-01-01"
        })

print(f"Processed {len(processed_products)} products.")

print("\nProcessing Customers...")
processed_customers = []
for c in customers_raw:
    name = strip_tags(c.get("name", ""))
    phone = strip_tags(c.get("mobile", "") or c.get("contact_id", ""))
    biz = strip_tags(c.get("business_name", ""))
    due = clean_amount(c.get("due", 0))
    total_sales = clean_amount(c.get("total_sale", 0))
    
    if name:
        processed_customers.append({
            "id": f"cust-{c.get('id', len(processed_customers)+1)}",
            "type": "customer",
            "name": name,
            "businessName": biz,
            "email": f"customer{len(processed_customers)+1}@tamannamotors.com",
            "phone": phone or "01700000000",
            "customerGroup": "Mechanic & Workshop" if "workshop" in name.lower() or "auto" in name.lower() else "Retail",
            "businessLocation": "Hazigonj Branch",
            "balance": due,
            "totalPurchases": total_sales,
            "address": "Hazigonj, Chandpur"
        })

print(f"Processed {len(processed_customers)} customers.")

print("\nProcessing Suppliers...")
processed_suppliers = []
for s in suppliers_raw:
    name = strip_tags(s.get("name", ""))
    phone = strip_tags(s.get("mobile", ""))
    biz = strip_tags(s.get("business_name", ""))
    due = clean_amount(s.get("due", 0))
    total_purchase = clean_amount(s.get("total_purchase", 0))
    
    if name:
        processed_suppliers.append({
            "id": f"sup-{s.get('id', len(processed_suppliers)+1)}",
            "type": "supplier",
            "name": name,
            "businessName": biz or name,
            "email": f"supplier{len(processed_suppliers)+1}@tamannamotors.com",
            "phone": phone or "01800000000",
            "businessLocation": "Hazigonj Branch",
            "balance": due,
            "totalPurchases": total_purchase,
            "address": "Dhaka / Chittagong / Chandpur"
        })

print(f"Processed {len(processed_suppliers)} suppliers.")

print("\nProcessing Sales...")
processed_sales = []
for sl in sells_raw:
    inv = strip_tags(sl.get("invoice_no", ""))
    cust = strip_tags(sl.get("name", "") or sl.get("customer_name", ""))
    tot = clean_amount(sl.get("final_total", 0))
    due = clean_amount(sl.get("total_remaining", 0))
    dt = strip_tags(sl.get("transaction_date", ""))
    pay_status = strip_tags(sl.get("payment_status", "Paid"))
    
    if inv:
        processed_sales.append({
            "id": f"sale-{sl.get('id', len(processed_sales)+1)}",
            "invoiceNo": inv,
            "type": "pos",
            "customerName": cust or "Walk-in Customer",
            "businessLocation": "Hazigonj Branch",
            "paymentStatus": "Paid" if due <= 0 else ("Partial" if tot > due > 0 else "Due"),
            "paymentMethod": "Cash",
            "totalAmount": tot,
            "invoiceDue": due,
            "saleDate": dt or "Today",
            "itemsCount": 2
        })

print(f"Processed {len(processed_sales)} sales.")

print("\nProcessing Purchases...")
processed_purchases = []
for p in purchases_raw:
    ref = strip_tags(p.get("ref_no", ""))
    sup = strip_tags(p.get("name", "") or p.get("supplier", ""))
    tot = clean_amount(p.get("final_total", 0))
    due = clean_amount(p.get("payment_due", 0))
    dt = strip_tags(p.get("transaction_date", ""))
    
    if ref:
        processed_purchases.append({
            "id": f"po-{p.get('id', len(processed_purchases)+1)}",
            "purchaseNo": ref,
            "supplierName": sup or "Main Distributor",
            "businessLocation": "Hazigonj Branch",
            "purchaseStatus": "Received",
            "paymentStatus": "Paid" if due <= 0 else "Due",
            "purchaseDate": dt or "Today",
            "grandTotal": tot,
            "paymentDue": due,
            "itemsCount": 5
        })

print(f"Processed {len(processed_purchases)} purchases.")

print("\nProcessing Expenses...")
processed_expenses = []
for e in expenses_raw:
    ref = strip_tags(e.get("ref_no", ""))
    cat = strip_tags(e.get("category", ""))
    amt = clean_amount(e.get("final_total", 0))
    dt = strip_tags(e.get("transaction_date", ""))
    note = strip_tags(e.get("additional_notes", ""))
    
    if ref or amt > 0:
        processed_expenses.append({
            "id": f"exp-{e.get('id', len(processed_expenses)+1)}",
            "expenseNo": ref or f"EXP-{len(processed_expenses)+1}",
            "category": cat or "General Overhead",
            "businessLocation": "Hazigonj Branch",
            "amount": amt,
            "expenseDate": dt or "Today",
            "note": note or "Shop operational expense"
        })

print(f"Processed {len(processed_expenses)} expenses.")

out_data = {
    "products": processed_products,
    "customers": processed_customers,
    "suppliers": processed_suppliers,
    "sales": processed_sales,
    "purchases": processed_purchases,
    "expenses": processed_expenses
}

with open("src/data/importedTamannaData.json", "w", encoding="utf-8") as f:
    json.dump(out_data, f, indent=2, ensure_ascii=False)

print("\nAll data successfully exported to src/data/importedTamannaData.json!")
