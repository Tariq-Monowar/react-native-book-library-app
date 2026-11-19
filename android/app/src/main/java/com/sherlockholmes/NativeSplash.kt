package com.holmes_somograh

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.Activity
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.SystemClock
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.animation.PathInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.vectordrawable.graphics.drawable.AnimatedVectorDrawableCompat

/**
 * The opening animation, drawn natively.
 *
 * It starts in the activity's first frame, before React Native has loaded
 * any JavaScript, so on slower phones (where loading takes a few seconds)
 * the animation is already playing while the app gets ready underneath,
 * instead of a still picture sitting on screen. When the app has drawn its
 * first screen it calls [finish], and the splash fades away (but never before
 * its own animation has played through once).
 *
 * The first frame matches the phone's launch picture exactly: the app's
 * background colour (light or dark) with the 112dp icon in the centre.
 */
class NativeSplash(private val activity: Activity) {

  private val root = FrameLayout(activity)
  private val icon = ImageView(activity)
  private val rings = ImageView(activity)
  private val title = TextView(activity)
  private val line = View(activity)
  private val subtitle = TextView(activity)
  private val startedAt = SystemClock.uptimeMillis()
  private var appReady = false
  private var removed = false

  private fun dp(value: Float) =
      TypedValue.applyDimension(
          TypedValue.COMPLEX_UNIT_DIP, value, activity.resources.displayMetrics)

  fun show() {
    val dark =
        (activity.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES
    // Same colours as the app (ThemeContext / SplashOverlay).
    val pageColor = Color.parseColor(if (dark) "#2A2A2A" else "#F9FAFC")
    val titleColor = Color.parseColor(if (dark) "#E1E1E1" else "#0A1930")
    val subtitleColor = Color.parseColor(if (dark) "#A8A8A8" else "#5B6577")
    val accent = Color.parseColor(if (dark) "#D9B77A" else "#263147")
    val font =
        try {
          Typeface.createFromAsset(activity.assets, "fonts/kalpurush.ttf")
        } catch (e: Exception) {
          Typeface.DEFAULT
        }

    root.setBackgroundColor(pageColor)
    root.isClickable = true // nothing underneath can be tapped meanwhile

    val logo = dp(112f).toInt()
    // Spreading rings, drawn and animated on the render thread (see
    // res/drawable/splash_rings_animated.xml).
    val ringsDrawable =
        AnimatedVectorDrawableCompat.create(activity, R.drawable.splash_rings_animated)
    rings.setImageDrawable(ringsDrawable)
    val ringsSize = dp(300f).toInt()
    root.addView(rings, FrameLayout.LayoutParams(ringsSize, ringsSize, Gravity.CENTER))
    ringsDrawable?.start()
    icon.setImageResource(R.drawable.splash_logo)
    root.addView(icon, FrameLayout.LayoutParams(logo, logo, Gravity.CENTER))

    // The name, a short rule and the author, hanging below the icon.
    val texts =
        LinearLayout(activity).apply {
          orientation = LinearLayout.VERTICAL
          gravity = Gravity.CENTER_HORIZONTAL
        }
    title.apply {
      text = "শার্লক হোমস সমগ্র"
      gravity = Gravity.CENTER
      includeFontPadding = false
      typeface = font
      setTextColor(titleColor)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 30f)
      alpha = 0f
    }
    line.apply {
      background =
          GradientDrawable().apply {
            setColor(accent)
            cornerRadius = dp(1f)
          }
      scaleX = 0f
    }
    subtitle.apply {
      text = "স্যার আর্থার কোনান ডয়েল"
      gravity = Gravity.CENTER
      includeFontPadding = false
      typeface = font
      setTextColor(subtitleColor)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16.5f)
      alpha = 0f
    }
    texts.addView(
        title,
        LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    texts.addView(
        line,
        LinearLayout.LayoutParams(dp(44f).toInt(), dp(2f).toInt()).apply {
          topMargin = dp(8f).toInt()
          bottomMargin = dp(8f).toInt()
        })
    texts.addView(
        subtitle,
        LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    root.addView(
        texts,
        FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.TOP)
            .apply {
              // Centre of the screen + half the icon + a gap.
              topMargin =
                  (activity.resources.displayMetrics.heightPixels / 2 + logo / 2 + dp(26f))
                      .toInt()
            })

    // On top of everything, the whole window, like the launch picture.
    (activity.window.decorView as ViewGroup).addView(
        root,
        ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    play()
  }

  private fun play() {
    val ease = PathInterpolator(0.22f, 1f, 0.36f, 1f)
    val rise = dp(14f)
    title.translationY = rise
    subtitle.translationY = dp(10f)

    // The icon "breathes" once.
    val pulse = ValueAnimator.ofFloat(0f, 1f, 0f)
    pulse.duration = 560
    pulse.addUpdateListener {
      val scale = 1f + 0.06f * (it.animatedValue as Float)
      icon.scaleX = scale
      icon.scaleY = scale
    }

    fun reveal(view: View, delay: Long): Animator =
        AnimatorSet().apply {
          playTogether(
              ObjectAnimator.ofFloat(view, View.ALPHA, 0f, 1f),
              ObjectAnimator.ofFloat(view, View.TRANSLATION_Y, view.translationY, 0f))
          duration = 520
          startDelay = delay
          interpolator = ease
        }

    val rule =
        ObjectAnimator.ofFloat(line, View.SCALE_X, 0f, 1f).apply {
          duration = 460
          startDelay = 300
          interpolator = ease
        }

    AnimatorSet()
        .apply {
          playTogether(
              pulse,
              // Everything starts at once, so there is movement from the
              // very first frame.
              reveal(title, 120),
              rule,
              reveal(subtitle, 420))
          addListener(
              object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                  maybeFinish()
                }
              })
        }
        .start()
  }

  /** The app has drawn its first screen underneath. */
  fun finish() {
    appReady = true
    maybeFinish()
  }

  private fun maybeFinish() {
    // Leave once the app is ready and the animation has played through.
    if (removed || !appReady) {
      return
    }
    val wait = MIN_SHOW_MS - (SystemClock.uptimeMillis() - startedAt)
    if (wait > 0) {
      root.postDelayed({ maybeFinish() }, wait)
      return
    }
    removed = true
    root.animate()
        .alpha(0f)
        .setDuration(300)
        .withEndAction { (root.parent as? ViewGroup)?.removeView(root) }
        .start()
    icon.animate().scaleX(1.14f).scaleY(1.14f).setDuration(300).start()
  }

  companion object {
    // The animation's own length: it always plays through once.
    private const val MIN_SHOW_MS = 1300L
  }
}
