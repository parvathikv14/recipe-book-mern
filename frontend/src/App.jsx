import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChefHat, Clock3, Plus, Search, Pencil, Trash2, ArrowLeft, X, Utensils, Leaf } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const emptyForm = { name: "", category: "Breakfast", ingredients: "", steps: "", cookingTime: "30" };
const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Drink", "Other"];

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");
  return data;
}

function linesToArray(value) {
  return value.split(/\n|,/).map((line) => line.trim()).filter(Boolean);
}
function formFromRecipe(recipe) {
  return {
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients.join("\n"),
    steps: recipe.steps.join("\n"),
    cookingTime: String(recipe.cookingTime),
  };
}

const starters = [
  { name: "Amma's Masala Dosa", category: "Breakfast", time: "35 min", note: "Crisp edges, soft centre", tone: "gold" },
  { name: "Kerala Vegetable Stew", category: "Lunch", time: "30 min", note: "Coconut milk & gentle spices", tone: "green" },
  { name: "Tomato Rasam", category: "Dinner", time: "20 min", note: "Peppery, tangy comfort", tone: "red" },
];

function RecipeForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");
  useEffect(() => setForm(initial || emptyForm), [initial]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    const ingredients = linesToArray(form.ingredients);
    const steps = linesToArray(form.steps);
    const cookingTime = Number(form.cookingTime);
    if (form.name.trim().length < 2) return setError("Give your recipe a name (at least 2 characters).");
    if (!ingredients.length) return setError("Add at least one ingredient.");
    if (!steps.length) return setError("Add at least one preparation step.");
    if (!Number.isInteger(cookingTime) || cookingTime < 1 || cookingTime > 1440) return setError("Cooking time must be a whole number from 1 to 1440.");
    try {
      await onSave({ name: form.name.trim(), category: form.category, ingredients, steps, cookingTime });
    } catch (e) { setError(e.message); }
  }

  return <form className="recipe-form" onSubmit={submit}>
    <div className="form-heading"><div><span className="eyebrow">FROM YOUR KITCHEN</span><h2>{initial ? "Edit recipe" : "Add a recipe"}</h2><p>Keep the little details that make it yours.</p></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Close form"><X size={19}/></button></div>
    <label>Recipe name<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Sunday chicken biryani" maxLength={100} required /></label>
    <div className="form-row">
      <label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>Cooking time (minutes)<input type="number" min="1" max="1440" step="1" value={form.cookingTime} onChange={(e) => update("cookingTime", e.target.value)} required /></label>
    </div>
    <label>Ingredients <span className="label-hint">one per line</span><textarea rows="5" value={form.ingredients} onChange={(e) => update("ingredients", e.target.value)} placeholder={"2 cups rice\n1 onion, sliced\n1 tsp ginger-garlic paste"} required /></label>
    <label>Preparation steps <span className="label-hint">one step per line</span><textarea rows="5" value={form.steps} onChange={(e) => update("steps", e.target.value)} placeholder={"Wash and prepare the ingredients.\nCook gently until ready.\nTaste, garnish and serve."} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="button button-light" onClick={onCancel}>Cancel</button><button className="button button-dark" type="submit" disabled={saving}>{saving ? "Saving…" : initial ? "Save changes" : "Save recipe"}</button></div>
  </form>;
}

function RecipeDetail({ recipe, onClose, onEdit, onDelete }) {
  if (!recipe) return null;
  return <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label={`${recipe.name} details`}>
      <button className="icon-button detail-close" onClick={onClose} aria-label="Close details"><X size={20}/></button>
      <div className="detail-art"><span className="detail-stamp"><ChefHat size={17}/> HOME COOKED</span><Utensils size={58} strokeWidth={1.15}/><span className="detail-category">{recipe.category}</span></div>
      <div className="detail-body">
        <span className="eyebrow">A RECIPE TO KEEP</span><h2>{recipe.name}</h2><p className="detail-time"><Clock3 size={16}/> {recipe.cookingTime} minutes</p>
        <div className="detail-section"><h3>What you'll need</h3><ul>{recipe.ingredients.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul></div>
        <div className="detail-section"><h3>How to make it</h3><ol>{recipe.steps.map((step, i) => <li key={`${i}-${step}`}><span className="step-number">{i + 1}</span><span>{step}</span></li>)}</ol></div>
        <div className="detail-actions"><button className="button button-light" onClick={() => onEdit(recipe)}><Pencil size={15}/> Edit recipe</button><button className="button button-delete" onClick={() => onDelete(recipe)}><Trash2 size={15}/> Delete</button></div>
      </div>
    </section>
  </div>;
}

function RecipeCard({ recipe, onOpen, onEdit, onDelete, index }) {
  const tone = ["gold", "green", "red", "blue"][index % 4];
  return <article className="recipe-card">
    <button className={`card-art art-${tone}`} onClick={() => onOpen(recipe)} aria-label={`View ${recipe.name}`}>
      <span className="card-category">{recipe.category}</span><span className="food-illustration"><Utensils size={37} strokeWidth={1.2}/></span><span className="art-caption">FROM MY KITCHEN</span>
    </button>
    <div className="card-content">
      <button className="card-title" onClick={() => onOpen(recipe)}>{recipe.name}</button>
      <p className="card-note">{recipe.ingredients?.length || 0} ingredients <span>·</span> {recipe.steps?.length || 0} steps</p>
      <div className="card-bottom"><span className="time-chip"><Clock3 size={14}/>{recipe.cookingTime} min</span><div className="card-tools"><button className="mini-button" onClick={() => onEdit(recipe)} aria-label={`Edit ${recipe.name}`}><Pencil size={15}/></button><button className="mini-button danger" onClick={() => onDelete(recipe)} aria-label={`Delete ${recipe.name}`}><Trash2 size={15}/></button></div></div>
    </div>
  </article>;
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All recipes");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadRecipes() {
    setLoading(true); setLoadError("");
    try { setRecipes(await request("/recipes")); }
    catch (error) { setLoadError(error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadRecipes(); }, []);

  const filtered = useMemo(() => recipes.filter((recipe) =>
    (category === "All recipes" || recipe.category === category) &&
    `${recipe.name} ${recipe.category} ${(recipe.ingredients || []).join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [recipes, category, query]);

  function startAdd() { setEditing(null); setSelected(null); setShowForm(true); setNotice(""); }
  function startEdit(recipe) { setEditing(recipe); setSelected(null); setShowForm(true); setNotice(""); }
  async function saveRecipe(data) {
    setSaving(true);
    try {
      const saved = editing
        ? await request(`/recipes/${editing._id}`, { method: "PUT", body: JSON.stringify(data) })
        : await request("/recipes", { method: "POST", body: JSON.stringify(data) });
      setRecipes((current) => editing ? current.map((r) => r._id === saved._id ? saved : r) : [saved, ...current]);
      setShowForm(false); setEditing(null); setNotice(editing ? "Recipe updated. Looking good!" : "Recipe saved to your book.");
    } finally { setSaving(false); }
  }
  async function deleteRecipe(recipe) {
    if (!window.confirm(`Delete "${recipe.name}" from your recipe book? This cannot be undone.`)) return;
    try {
      await request(`/recipes/${recipe._id}`, { method: "DELETE" });
      setRecipes((current) => current.filter((r) => r._id !== recipe._id));
      setSelected(null); setNotice("Recipe removed from your book.");
    } catch (error) { setNotice(error.message); }
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setShowForm(false); setSelected(null); }}><span className="brand-icon"><BookOpen size={21}/></span><span>the recipe <b>book</b></span></a><span className="top-note"><Leaf size={15}/> GOOD FOOD, KEPT CLOSE</span><button className="button button-dark top-add" onClick={startAdd}><Plus size={17}/> Add recipe</button></header>
    <main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/> YOUR PERSONAL COLLECTION</span><h1>Made with love.<br/><em>Saved for later.</em></h1><p>Family favourites, little experiments, and the dishes you never want to forget.</p><button className="button button-dark hero-cta" onClick={startAdd}><Plus size={17}/> Write down a recipe</button><div className="hero-meta"><span><span className="meta-dot"/> YOUR OWN KITCHEN JOURNAL</span><span>NO TWO RECIPES ALIKE</span></div></div>
        <div className="hero-visual"><div className="hero-circle"></div><div className="hero-plate"><div className="plate-ring"><div className="plate-food"><span className="food-leaf leaf-one"></span><span className="food-leaf leaf-two"></span><span className="food-dot dot-one"></span><span className="food-dot dot-two"></span><span className="food-dot dot-three"></span><span className="food-line"></span></div></div></div><div className="hero-note note-top">a pinch of this <span>✳</span></div><div className="hero-note note-bottom">a little bit of home</div><div className="hero-scribble">♡</div></div>
      </section>
      <section className="collection">
        <div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Your recipe shelf <span className="recipe-count">{recipes.length}</span></h2><p>A growing collection, one plate at a time.</p></div><div className="collection-tools"><label className="search-box"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a recipe..." aria-label="Search recipes"/></label></div></div>
        <div className="filter-row"><div className="filters">{["All recipes", ...categories].map((item) => <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="sort-note"><span className="sort-dot"/> MOST RECENT FIRST</span></div>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15}/></button></div>}
        {showForm && <div className="form-wrap"><RecipeForm key={editing?._id || "new"} initial={editing ? formFromRecipe(editing) : null} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={saveRecipe} saving={saving}/></div>}
        {loading ? <div className="empty-state"><div className="empty-icon"><ChefHat size={27}/></div><h3>Setting the table…</h3><p>Fetching your recipes from the database.</p></div>
          : loadError ? <div className="empty-state"><div className="empty-icon"><BookOpen size={27}/></div><h3>Couldn't reach the recipe shelf</h3><p>{loadError}</p><button className="button button-light" onClick={loadRecipes}>Try again</button><p className="small-help">Check that the backend is running and MongoDB Atlas is connected.</p></div>
          : filtered.length ? <div className="recipe-grid">{filtered.map((recipe, index) => <RecipeCard key={recipe._id} recipe={recipe} index={index} onOpen={setSelected} onEdit={startEdit} onDelete={deleteRecipe}/>)}</div>
          : <div className="empty-state"><div className="empty-icon"><ChefHat size={27}/></div><h3>{recipes.length ? "Nothing on this shelf" : "Your recipe book starts here"}</h3><p>{recipes.length ? "Try another search or category." : "Add a family favourite to get things cooking."}</p>{!recipes.length && <button className="button button-dark" onClick={startAdd}><Plus size={17}/> Add your first recipe</button>}</div>}
      </section>
      <section className="kitchen-note"><span className="note-icon"><ChefHat size={21}/></span><div><span className="eyebrow">A NOTE FROM THE KITCHEN</span><p>The best recipes aren't just instructions. They're memories, shared around a table.</p></div><span className="note-heart">♡</span></section>
    </main>
    <footer><span>THE RECIPE BOOK <span className="footer-dot">·</span> MADE FOR EVERYDAY COOKS</span><span>Keep the good things cooking.</span></footer>
    {selected && <RecipeDetail recipe={selected} onClose={() => setSelected(null)} onEdit={startEdit} onDelete={deleteRecipe}/>}
  </div>;
}
