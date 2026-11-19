package com.holmes_somograh

import android.os.Build
import android.os.Bundle
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "holmes_somograh"

  /**
   * Shows the opening animation from the very first frame (see NativeSplash).
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    // Draw under the status bar from the very first frame (the app sets
    // this from JavaScript too, but only once it has started). Without it
    // the first frames are laid out lower, and the splash icon would jump.
    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility =
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
    window.statusBarColor = android.graphics.Color.TRANSPARENT
    // Android 12+: when the launch picture leaves, remove it at once rather
    // than fading it; the animation underneath starts from the same picture.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      splashScreen.setOnExitAnimationListener { view -> view.remove() }
    }
    // Start the opening animation now, natively, without waiting for the
    // JavaScript to load. JavaScript calls ThemeBridge.splashReady() once the
    // app has drawn its first screen, and the animation steps aside.
    val splash = NativeSplash(this)
    splash.show()
    ThemeBridgeModule.onSplashReady = { runOnUiThread { splash.finish() } }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
