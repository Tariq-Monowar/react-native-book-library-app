package com.holmes_somograh

import android.app.UiModeManager
import android.media.AudioAttributes
import android.media.SoundPool
import android.content.Context
import android.os.Build
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

/**
 * Tells Android which theme the reader chose inside the app (light, dark, or
 * follow the phone). Android remembers it and uses it the next time the app
 * starts, so the launch screen it draws before any JavaScript runs is already
 * in the app's colours. Needs Android 12 (API 31) or later; on older phones
 * this does nothing and the launch screen follows the phone.
 */
class ThemeBridgeModule(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

  override fun getName(): String = "ThemeBridge"

  // A short tap sound for buttons, played by the app itself so it is heard
  // on every phone, also those with the system "touch sounds" turned off.
  private val taps: SoundPool =
      SoundPool.Builder()
          .setMaxStreams(2)
          .setAudioAttributes(
              AudioAttributes.Builder()
                  .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                  .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                  .build())
          .build()
  private val tapSound = taps.load(context, R.raw.tap, 1)

  @ReactMethod
  fun playTap() {
    taps.play(tapSound, 0.3f, 0.3f, 1, 0, 1f)
  }

  companion object {
    /** Set by MainActivity: hides the native opening animation. */
    @Volatile @JvmStatic var onSplashReady: (() -> Unit)? = null
  }

  /** Called from JavaScript once the app has drawn its first screen. */
  @ReactMethod
  fun splashReady() {
    onSplashReady?.invoke()
  }

  /**
   * Remembers the theme chosen in the app (also for the next start, see
   * MainApplication) and, on Android 12+, tells the system too so its own
   * launch screen uses it.
   */
  @ReactMethod
  fun setNightMode(mode: String) {
    reactApplicationContext
        .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .edit()
        .putString(KEY_THEME, mode)
        .apply()
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return
    }
    val manager =
        reactApplicationContext.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
            ?: return
    val value =
        when (mode) {
          "dark" -> UiModeManager.MODE_NIGHT_YES
          "light" -> UiModeManager.MODE_NIGHT_NO
          else -> UiModeManager.MODE_NIGHT_AUTO
        }
    manager.setApplicationNightMode(value)
  }
}

const val PREFS = "app_theme"
const val KEY_THEME = "theme"

class ThemeBridgePackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
      listOf(ThemeBridgeModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
      emptyList()
}
