############################################################
# ⚙️ React Native + VisionCamera + Reanimated (Optimized)
############################################################

# ===== Core React Native =====
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.react.**

# ===== Reanimated & Gesture Handler =====
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# ===== VisionCamera =====
-keep class com.mrousavy.camera.** { *; }
-keep class com.mrousavy.** { *; }
-dontwarn com.mrousavy.**

# ===== ONNX Runtime (for AI / Face detection) =====
-keep class ai.onnxruntime.** { *; }

# ===== Async Storage =====
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ===== Geolocation =====
-keep class com.reactnativecommunity.geolocation.** { *; }

# ===== Background Service (React Native BGService) =====
-keep class com.asterinet.react.bgservice.** { *; }

# ===== Image Picker =====
-keep class com.imagepicker.** { *; }

# ===== OkHttp / Axios =====
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ===== JS Bridge / View Manager =====
-keepattributes *Annotation*
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

# ===== Promise / Async Handling =====
-keep class java.util.concurrent.** { *; }
-keep class java.util.function.** { *; }

# ===== Enums =====
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ===== Serializable Classes =====
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ===== Native Methods =====
-keepclasseswithmembernames class * {
    native <methods>;
}

# ===== Suppress Warnings =====
-dontwarn java.util.concurrent.**
-dontwarn java.util.function.**
-dontwarn javax.annotation.**
-dontwarn com.facebook.react.**
-dontwarn com.mrousavy.**
-dontwarn com.swmansion.**
-dontwarn okhttp3.**

# ===== Keep All App Models (Safe) =====
-keep class ** { *; }

# ===== React Native Specific Rules =====
# Keep our interfaces so they can be used by other ProGuard rules.
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }

# ===== Vector Icons =====
-keep class com.oblador.vectoricons.** { *; }

# ===== Hermes =====
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ===== Application classes =====
-keep class com.cloudtree.hrms.** { *; }

############################################################
# ✅ Notes:
# - Do not enable "minifyEnabled true" without this file.
# - Always rebuild with: ./gradlew clean && ./gradlew assembleRelease
############################################################
