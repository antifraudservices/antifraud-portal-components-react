# Integrate device assistance preferences

## Render the controls

Import `DeviceAssistancePreferences` from
`antifraud-portal-components-react/device-assistance-preferences` and its
`antifraud-portal-components-react/device-assistance-preferences.css` stylesheet
once in the application shell. The full package stylesheet includes it too.

Each feature supplies controlled `enabled`, `available`, localized labels and
`onEnabledChange` props. Use `detail` to explain unavailable hardware or runtime
support. Optional `onPrepare`, `prepareLabel` and `preparing` props provide a
separate preparation action and progress state. An enabled feature must remain
revocable even when its runtime becomes unavailable.

## Implement the host lifecycle

The user enables assistance and starts model preparation in separate actions.
The host detects hardware support, persists device preferences and starts any
model download only after an explicit preparation request. Opening the page or
enabling an option must not download a model.

When the user opts out, stop the feature's worker and invalidate its pending
results so a late completion cannot update the UI or retained state. Keep
preparation, availability and consent as distinct states: a checked preference
is not proof that the runtime is ready.

Account, profile and subject authorization remain server decisions. Obtain
microphone permission for the relevant capture operation, and apply the
separate subject telephone-authorization flow where required. Account-level
preferences cannot replace either check.

## Check the integration

Verify unavailable-state explanations, explicit preparation, progress and
opt-out during in-flight work. Confirm that a late worker result is discarded
and that reopening the page uses the host's saved preference without starting
a download. The current renderer uses web DOM; native rendering remains
future work over the same controlled contract.
