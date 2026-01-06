####################################
# React Native Core
####################################
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

####################################
# React Native Bridge / JS Modules
####################################
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { *; }

####################################
# Hermes
####################################
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

####################################
# ONNX Runtime
####################################
-keep class ai.onnxruntime.** { *; }
-dontwarn ai.onnxruntime.**

####################################
# Background Actions
####################################
-keep class com.react.rnbackgroundactions.** { *; }

####################################
# Your App Package
####################################
-keep class com.cloudtree.hrms.** { *; }

####################################
# Gson / JSON
####################################
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn com.google.gson.**
-keep class com.google.gson.** { *; }

####################################
# Kotlin
####################################
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.coroutines.**

####################################
# OkHttp / Networking (important for API calls)
####################################
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

####################################
# React Native Reanimated (VERY IMPORTANT)
####################################
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

####################################
# Vector Icons (fonts)
####################################
-keep class com.oblador.vectoricons.** { *; }

####################################
# Native Methods
####################################
-keepclasseswithmembernames class * {
    native <methods>;
}

####################################
# Debugging / Crash Logs (Recommended)
####################################
-keepattributes SourceFile,LineNumberTable
#################################
# Google Play Services (CRITICAL)
#################################
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

#################################
# Location
#################################
-keep class com.google.android.gms.location.** { *; }

#################################
# Background Actions
#################################
-keep class com.react.rnbackgroundactions.** { *; }

#################################
# React Native Image Picker
#################################
-keep class com.imagepicker.** { *; }
-dontwarn com.imagepicker.**

#################################
# WorkManager (background crash fix)
#################################
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**
