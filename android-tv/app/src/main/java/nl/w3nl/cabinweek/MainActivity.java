package nl.w3nl.cabinweek;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.InputEvent;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

/**
 * Cabin Week on Google TV.
 *
 * Het spel staat in de app (assets/game, door de workflow erin gezet) en wordt via een https-adres geladen,
 * zodat opslaan (localStorage) gewoon werkt en er geen internet nodig is.
 *
 * De afstandsbediening stuurt pijltjes en OK; die gaan als gewone toetsen naar het spel.
 * Een controller (PlayStation, Stadia, Xbox) geeft de app zelf door als window.__nativePad, in de standaardindeling
 * die js/gamepad.js verwacht, omdat de WebView de Gamepad API niet op elk toestel doorgeeft.
 * De terug-knop vraagt het spel om een stap terug (window.tvBack); op het titelscherm sluit de app.
 */
public class MainActivity extends Activity {
    private static final String START = "https://appassets.androidplatform.net/assets/game/index.html";

    private WebView web;
    private final boolean[] buttons = new boolean[17];
    private final int[] presses = new int[17];
    private final float[] axes = new float[4];
    private String lastPad = "";
    private boolean padQueued = false;
    private int dir = 0;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        setContentView(web);
        hideSystemBars();
        web.loadUrl(START);
        web.requestFocus();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    private static boolean fromController(InputEvent e) {
        int src = e.getSource();
        return (src & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
                || (src & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    /** Android-knop naar de knop in de standaardindeling (zoals in js/gamepad.js), of -1. */
    private static int standardButton(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BUTTON_A: return 0;      // ✕ / A: springen, kiezen
            case KeyEvent.KEYCODE_BUTTON_B: return 1;      // ○ / B: praten, terug
            case KeyEvent.KEYCODE_BUTTON_X: return 2;      // □ / X: praten
            case KeyEvent.KEYCODE_BUTTON_Y: return 3;      // △ / Y: praten
            case KeyEvent.KEYCODE_BUTTON_L1: return 4;
            case KeyEvent.KEYCODE_BUTTON_R1: return 5;
            case KeyEvent.KEYCODE_BUTTON_L2: return 6;     // L1/R1/L2/R2: rennen
            case KeyEvent.KEYCODE_BUTTON_R2: return 7;
            case KeyEvent.KEYCODE_BUTTON_SELECT: return 8;
            case KeyEvent.KEYCODE_BUTTON_START: return 9;  // Start: menu
            case KeyEvent.KEYCODE_DPAD_UP: return 12;
            case KeyEvent.KEYCODE_DPAD_DOWN: return 13;
            case KeyEvent.KEYCODE_DPAD_LEFT: return 14;
            case KeyEvent.KEYCODE_DPAD_RIGHT: return 15;
            default: return -1;
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        boolean down = e.getAction() == KeyEvent.ACTION_DOWN;
        if (e.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            // De terug-knop: het spel doet een stap terug; op het titelscherm sluit de app.
            if (!down && e.getRepeatCount() == 0) {
                web.evaluateJavascript("window.tvBack ? window.tvBack() : false", value -> {
                    if ("true".equals(value)) return;
                    // Op de privacypagina (of een link daarvandaan): Terug gaat naar het spel, niet uit de app.
                    String url = web.getUrl();
                    if (url != null && !url.contains("/index.html") && web.canGoBack()) web.goBack();
                    else finish();
                });
            }
            return true;
        }
        if (fromController(e)) {
            int b = standardButton(e.getKeyCode());
            if (b >= 0) {
                if (buttons[b] != down) { buttons[b] = down; if (down) presses[b]++; sendDir(e.getEventTime()); sendPad(); }
                return true;
            }
        }
        return super.dispatchKeyEvent(e);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent e) {
        if (fromController(e) && e.getAction() == MotionEvent.ACTION_MOVE) {
            axes[0] = e.getAxisValue(MotionEvent.AXIS_X);
            axes[1] = e.getAxisValue(MotionEvent.AXIS_Y);
            axes[2] = e.getAxisValue(MotionEvent.AXIS_Z);
            axes[3] = e.getAxisValue(MotionEvent.AXIS_RZ);
            // de pijltjes van een PlayStation-controller komen vaak als "hat"-as binnen
            float hx = e.getAxisValue(MotionEvent.AXIS_HAT_X), hy = e.getAxisValue(MotionEvent.AXIS_HAT_Y);
            hat(14, hx < -.5f); hat(15, hx > .5f); hat(12, hy < -.5f); hat(13, hy > .5f);
            sendDir(e.getEventTime());
            sendPad();
            return true;
        }
        return super.dispatchGenericMotionEvent(e);
    }

    /**
     * Links of rechts (pijltjes, hat of stick, net als in js/gamepad.js) meteen doorgeven als het verandert, met hoe lang
     * geleden het gebeurde. Zo loopt het poppetje precies zo lang als je drukte, ook als het bericht wat later aankomt.
     */
    private void sendDir(long eventTime) {
        float x = Float.isNaN(axes[0]) ? 0 : axes[0];
        int d = (buttons[14] || x < -.4f) ? -1 : (buttons[15] || x > .4f) ? 1 : 0;
        if (d == dir) return;
        dir = d;
        long age = Math.max(0, SystemClock.uptimeMillis() - eventTime);
        web.evaluateJavascript("window.__tvDir&&window.__tvDir(" + d + "," + age + ")", null);
    }

    private void hat(int b, boolean on) {
        if (on && !buttons[b]) presses[b]++;
        buttons[b] = on;
    }

    /**
     * Stuur de stand van de controller naar het spel, hoogstens één keer per beeld. Een stick geeft honderden
     * kleine bewegingen per seconde; elk daarvan apart doorgeven liet het spel haperen.
     */
    private void sendPad() {
        if (padQueued) return;
        padQueued = true;
        web.postOnAnimation(this::flushPad);
    }

    private void flushPad() {
        padQueued = false;
        StringBuilder js = new StringBuilder("window.__nativePad={buttons:[");
        for (int i = 0; i < buttons.length; i++) js.append(i > 0 ? "," : "").append(buttons[i] ? 1 : 0);
        js.append("],presses:[");
        for (int i = 0; i < presses.length; i++) js.append(i > 0 ? "," : "").append(presses[i]);
        js.append("],axes:[");
        for (int i = 0; i < axes.length; i++) {
            float a = Float.isNaN(axes[i]) ? 0 : Math.round(axes[i] * 100) / 100f; // afgerond: geen ruis doorsturen
            js.append(i > 0 ? "," : "").append(a);
        }
        js.append("]};");
        String out = js.toString();
        if (out.equals(lastPad)) return; // niets veranderd
        lastPad = out;
        web.evaluateJavascript(out, null);
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
