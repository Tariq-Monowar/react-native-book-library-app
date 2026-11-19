# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Native modules reached from JavaScript by name must not be renamed or removed.
-keep class com.holmes_somograh.** { *; }
-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod *; }
# Older libraries that do not ship their own rules.
-keep class org.pgsqlite.** { *; }
-keep class io.liteglue.** { *; }
-keep class fr.greweb.reactnativeviewshot.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
