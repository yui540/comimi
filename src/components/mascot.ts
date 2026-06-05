import type { MascotAreaOptions, MascotOption } from "../types";

export type MascotArea = "splash" | "menu" | "loading" | "error";

function isAreaOptions(
  mascot: MascotOption | MascotAreaOptions
): mascot is MascotAreaOptions {
  return (
    typeof mascot === "object" &&
    mascot !== null &&
    !("src" in mascot) &&
    !("render" in mascot) &&
    !("html" in mascot)
  );
}

/**
 * `mascot` オプションから指定エリアの設定を解決する。
 * - 単一の `MascotOption`（`false` 含む）はスプラッシュ／メニューにのみ適用し、
 *   読み込み中／失敗は従来どおりデフォルト（`undefined`）にする。
 * - エリア別オブジェクトは該当キー → `default` の順でフォールバックする。
 */
export function resolveMascot(
  mascot: MascotOption | MascotAreaOptions | undefined,
  area: MascotArea
): MascotOption | undefined {
  if (mascot === undefined) {
    return undefined;
  }
  if (mascot === false || !isAreaOptions(mascot)) {
    return area === "splash" || area === "menu" ? mascot : undefined;
  }
  return mascot[area] ?? mascot.default;
}

/**
 * カスタム指定（`src` / `render` / `html`）から表示用ノードを生成する。
 * `false` / `undefined`（＝デフォルト表示）の場合は null を返す。
 */
export function buildMascotNode(
  option: MascotOption | undefined
): HTMLElement | null {
  if (!option) {
    return null;
  }
  if ("render" in option) {
    return option.render();
  }
  if ("html" in option) {
    const el = document.createElement("div");
    el.className = "comimi-mascot-html";
    el.innerHTML = option.html;
    return el;
  }
  const img = document.createElement("img");
  img.src = option.src;
  img.alt = option.alt ?? "";
  img.draggable = false;
  return img;
}
