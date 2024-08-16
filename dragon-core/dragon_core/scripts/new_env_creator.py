"""
The following script creates a generic notebook based on real notes.

The data is all fake and simulated, it is mainly used to show the Lab dragon more than anything else.

TODO: Add json files to the instances.
TODO: Add Jupyter notebooks to instances.


"""
import time
from pathlib import Path
from typing import Tuple

import numpy as np
import matplotlib.pyplot as plt

# Pfafflab lab code used to simulate data.
from labcore.analysis.fit import Fit
from labcore.data.datadict import DataDict
from labcore.analysis.fitfuncs.generic import Cosine
from labcore.data.datadict_storage import datadict_to_hdf5

from dragon_core.modules import Bucket, Project, Task, Step, Instance
from dragon_core.utils import delete_directory_contents


def simulate_resonator_response(f0, Q, Qc, f_start, f_end, path) -> Tuple[Path, Path, Path]:
    """
    Simulates a resonator response. To be used only for generating fake data.

    :param f_start: The start of the x axis.
    :param f_end: The end of the x axis.
    :param path: The path where the data and plots will be saved.
    """
    f0_global = f0
    Q_global = Q
    Qc_global = Qc

    path = Path(path)

    frequencies = np.linspace(f_start, f_end, 1000)
    x = 1 - (Q / Qc) / (1 + 2j * Q * (frequencies - f0) / f0)
    noise = np.random.normal(0, 0.01, size=x.shape) + 1j * np.random.normal(0, 0.01, size=x.shape)
    x_noise = x + noise

    # Plotting the response
    plt.figure(figsize=(8, 4))
    plt.plot(frequencies, 20 * np.log10(np.abs(x_noise)), label='Measured S21 (dB)')
    plt.title('Resonator Transmission Response')
    plt.xlabel('Frequency (Hz)')
    plt.ylabel('Magnitude (dB)')
    plt.legend()

    raw_figure_path = path / 'resonator_response_raw.png'
    if path is not None:
        plt.savefig(raw_figure_path)

    class ResonatorTransmissionResponse(Fit):
        @staticmethod
        def model(coordinates, f0, Q, Qc):
            return 1 - (Q / Qc) / (1 + 2j * Q * (coordinates - f0) / f0)

        @staticmethod
        def guess(coordinates, data):
            return dict(f0=f0_global, Q=Q_global, Qc=Qc_global)

    fit = ResonatorTransmissionResponse(frequencies, x_noise)
    result = fit.run()
    fit_data = result.eval()
    params = result.params_to_dict()

    plt.figure(figsize=(8, 4))
    plt.scatter(frequencies, x_noise, label='Data')
    plt.plot(frequencies, fit_data,
             label=f'Best fit \n f0: {params["f0"]["value"]:.2e} \n Q: {params["Q"]["value"]:.2e} \n Qc: {params["Qc"]["value"]:.2e}',
             color='r', linewidth=2)
    plt.title('Resonator Transmission Response With Fit')
    plt.xlabel('Delay (us)')
    plt.ylabel('Signal')
    plt.legend()

    fit_figure_path = path / 'resonator_response_fit.png'
    if path is not None:
        plt.savefig(fit_figure_path)

    data = DataDict(frequency=dict(unit='GHz'), signal=dict(unit='a.u.', axes=['frequency']))
    data.add_data(frequency=frequencies, signal=x_noise)
    data_path = path / 'data.ddh5'
    datadict_to_hdf5(data, data_path)

    return data_path, raw_figure_path, fit_figure_path


def simulate_power_rabi(t_start, t_end, path) -> Tuple[Path, Path, Path]:
    """
    Simulates a power rabi. To be used only for generating fake data.

    :param t_start: The start of the x axis.
    :param t_end: The end of the x axis.
    :param path: The path where the data and plots will be saved.
    """
    path = Path(path)
    amps = np.linspace(t_start, t_end, 150)
    probability_excited = np.sin(amps) ** 2  # Probability of being in the excited state

    # Add noise to simulate experimental data
    noise = np.random.normal(0, 0.05, size=probability_excited.shape)
    probability_excited_noisy = probability_excited + noise

    # Plotting the raw data
    plt.figure(figsize=(8, 4))
    plt.plot(amps, probability_excited_noisy, label='Simulated Rabi Oscillations')
    plt.title('Power Rabi Experiment')
    plt.xlabel('Amp [a.u.]')
    plt.ylabel('Excited State Probability')
    plt.legend()

    raw_figure_path = path / 'power_rabi_raw.png'
    plt.savefig(raw_figure_path)

    fit = Cosine(amps, probability_excited_noisy)
    result = fit.run()
    fit_data = result.eval()
    params = result.params_to_dict()

    plt.figure(figsize=(8, 4))
    plt.scatter(amps, probability_excited_noisy, label='Data')
    plt.plot(amps, fit_data,
             label=f'Best fit \n A: {params["A"]["value"]:.2e} \n f: {params["f"]["value"]:.2e} \n phi: {params["phi"]["value"]:.2e} \n of: {params["of"]["value"]:.2e}',
             color='r', linewidth=2)
    plt.title('Power Rabi With Fit')
    plt.xlabel('Amp [a.u.]')
    plt.ylabel('Excited State Probability')
    plt.legend()

    fit_figure_path = path / 'power_rabi_fit.png'
    plt.savefig(fit_figure_path)

    data = DataDict(amp=dict(unit=''), probability=dict(unit='', axes=['amp']))
    data.add_data(amp=amps, probability=probability_excited_noisy)
    data_path = path / 'data.ddh5'
    datadict_to_hdf5(data, data_path)

    return data_path, raw_figure_path, fit_figure_path


def simulate_t1(A, of, tau, t_start, t_end,  path) -> Tuple[Path, Path, Path]:
    """
    Simulates a t1. To be used only for generating fake data.

    :param t_start: The start of the x axis.
    :param t_end: The end of the x axis.
    :param path: The path where the data and plots will be saved.
    """
    A_global = A
    of_global = of
    tau_global = tau

    path = Path(path)
    times = np.linspace(t_start, t_end, 300)
    decay = A * np.exp(-times / tau) + of

    # Add noise to simulate experimental data
    noise = np.random.normal(0, 0.3e-5, size=decay.shape)
    decay_noisy = decay + noise

    # Plotting the raw data
    plt.figure(figsize=(8, 4))
    plt.plot(times, decay_noisy, label='Simulated T1 Decay')
    plt.title('T1 Experiment')
    plt.xlabel('Time [us]')
    plt.ylabel('Signal')
    plt.legend()

    raw_figure_path = path / 't1_raw.png'
    plt.savefig(raw_figure_path)

    class ExponentialDecay(Fit):
        @staticmethod
        def model(coordinates, A, of, tau):
            return A * np.exp(-coordinates / tau) + of

        @staticmethod
        def guess(coordinates, data):
            return dict(A=A_global, of=of_global, tau=tau_global)

    fit = ExponentialDecay(times, decay_noisy)
    result = fit.run()
    fit_data = result.eval()
    params = result.params_to_dict()

    plt.figure(figsize=(8, 4))
    plt.scatter(times, decay_noisy, label='Data')
    plt.plot(times, fit_data,
             label=f'Best fit \n A: {params["A"]["value"]:.2e} \n of: {params["of"]["value"]:.2e} \n tau: {params["tau"]["value"]:.2e}',
             color='r', linewidth=2)
    plt.title('T1 With Fit')
    plt.xlabel('Time [us]')
    plt.ylabel('Signal')
    plt.legend()

    fit_figure_path = path / 't1_fit.png'
    plt.savefig(fit_figure_path)

    data = DataDict(time=dict(unit='us'), signal=dict(unit='a.u.', axes=['time']))
    data.add_data(time=times, signal=decay_noisy)
    data_path = path / 'data.ddh5'
    datadict_to_hdf5(data, data_path)

    return data_path, raw_figure_path, fit_figure_path


def simulate_t2(A, of, f, phi, tau, t_start, t_end, path) -> Tuple[Path, Path, Path]:
    """
    Simulates a t2. To be used only for generating fake data.

    :param t_start: The start of the x axis.
    :param t_end: The end of the x axis.
    :param path: The path where the data and plots will be saved.
    """
    A_global = A
    of_global = of
    f_global = f
    phi_global = phi
    tau_global = tau

    path = Path(path)
    times = np.linspace(t_start, t_end, 300)
    decay = A * np.sin(2 * np.pi * (f * times + phi / 360)) * np.exp(-times / tau) + of

    # Add noise to simulate experimental data
    noise = np.random.normal(0, 0.3e-5, size=decay.shape)
    decay_noisy = decay + noise

    # Plotting the raw data
    plt.figure(figsize=(8, 4))
    plt.plot(times, decay_noisy, label='Simulated T2 Decay')
    plt.title('T2 Experiment')
    plt.xlabel('Time [us]')
    plt.ylabel('Signal')
    plt.legend()

    raw_figure_path = path / 't2_raw.png'
    plt.savefig(raw_figure_path)

    class ExponentiallyDecayingSine(Fit):
        @staticmethod
        def model(coordinates, A, of, f, phi, tau):
            return A * np.sin(2 * np.pi * (f * coordinates + phi / 360)) * np.exp(-coordinates / tau) + of

        @staticmethod
        def guess(coordinates, data):
            return dict(A=A_global, of=of_global, f=f_global, phi=phi_global, tau=tau_global)

    fit = ExponentiallyDecayingSine(times, decay_noisy)
    result = fit.run()
    fit_data = result.eval()
    params = result.params_to_dict()

    plt.figure(figsize=(8, 4))
    plt.scatter(times, decay_noisy, label='Data')
    plt.plot(times, fit_data,
             label=f'Best fit \n A: {params["A"]["value"]:.2e} \n of: {params["of"]["value"]:.2e} \n f: {params["f"]["value"]:.2e} \n phi: {params["phi"]["value"]:.2e} \n tau: {params["tau"]["value"]:.2e}',
             color='r', linewidth=2)
    plt.title('T2 With Fit')
    plt.xlabel('Time [us]')
    plt.ylabel('Signal')
    plt.legend()

    fit_figure_path = path / 't2_fit.png'
    plt.savefig(fit_figure_path)

    data = DataDict(time=dict(unit='us'), signal=dict(unit='a.u.', axes=['time']))
    data.add_data(time=times, signal=decay_noisy)
    data_path = path / 'data.ddh5'
    datadict_to_hdf5(data, data_path)

    return data_path, raw_figure_path, fit_figure_path


def create_simulated_env(target: Path) -> None:
    """
    Creates a demo notebook with fake data generated on the fly.

    :param target: The location of the demo notebook files.
    """
    pages_to_create = []
    target = target.resolve()

    if not target.exists():
        target.mkdir(parents=True, exist_ok=True)

    delete_directory_contents(target)

    # Creating data bucket
    data_path = target / 'data'
    data_path.mkdir(exist_ok=True)

    bucket = Bucket(name='Measurements',
                    user='Smuag')
    bucket_path = data_path / f"{bucket.ID[:8]}_Measurements.toml"
    pages_to_create.append((bucket, bucket_path))

    root = Project(name='Demo Notebook',
                   user='Smuag',
                   data_buckets=[str(bucket_path)],
                   comments=[
                       'The following is a demo notebook written by the superconductor dragon called Smuag (any similarities with other dragons is merely a coincidence). \n'
                       'Please feel free to edit as much as you want. Instructions on how to reset this notebook are in the quickstart section of the README'])

    root_path = Path(target, f"{root.ID[:8]}_Demo Notebook.toml").resolve()
    pages_to_create.append((root, root_path))

    qubit_characterization_project = Project(name='Chocolate mk3 I Tune-up',
                                             user='Smuag',
                                             parent=root_path,
                                             comments=['Summary of findings from the Chocolate mk3 I Tune-up: \n \n'
                                                       '| Property | Value | Notes |\n'
                                                       '|----------|----------|----------|\n'
                                                       '| Resonator Freq | 7.1294GHz |  |\n'
                                                       '| Readout amp | 0.035 |  |\n'
                                                       '| Readout length | 1000 |  |\n'
                                                       '| Qubit Freq | 5.025GHz |  |\n'
                                                       '| Pi pulse amp | 0.065 |  |\n'
                                                       '| Pi pulse sigma | 40 ns | 6 sigma |\n'
                                                       '| T1 | 31.2 us |  |\n'
                                                       '| T2 Ramsey | 28.7 us |  |\n'
                                                       '| T2 Echo | 37 us |  |\n',
                                                       'Calling this one qA'],
                                             )

    qubit_characterization_project_path = Path(target,
                                               f"{qubit_characterization_project.ID[:8]}_Chocolate mk3 I Tune-up.toml").resolve()
    root.add_child(qubit_characterization_project_path)
    pages_to_create.append((qubit_characterization_project, qubit_characterization_project_path))

    finding_resonator_freq_task = Task(name='Finding Resonator Frequency',
                                       user='Smuag',
                                       parent=qubit_characterization_project_path,
                                       )

    finding_resonator_freq_task_path = Path(target,
                                            f"{finding_resonator_freq_task.ID[:8]}_Finding Resonator Frequency.toml").resolve()
    qubit_characterization_project.add_child(finding_resonator_freq_task_path)
    pages_to_create.append((finding_resonator_freq_task, finding_resonator_freq_task_path))

    finding_resonator_1_path = data_path/'finding_resonator_1'
    finding_resonator_1_path.mkdir(exist_ok=True)

    finding_resonator_1_star_tag_path = finding_resonator_1_path/'__star__.tag'
    finding_resonator_1_star_tag_path.touch(exist_ok=True)

    data_path_1, raw_figure_path_1, fit_figure_path_1 = simulate_resonator_response(f0=4.94e9, Q=1000, Qc=10000,
                                                                                    f_start=5e9, f_end=5.05e9,
                                                                                    path=finding_resonator_1_path)
    finding_resonator_1_instance = Instance(name='Finding Resonator 1',
                                            user='Smuag',
                                            parent=bucket_path,
                                            data=[str(data_path_1)],
                                            )

    finding_resonator_1_instance_path = finding_resonator_1_path/f"{finding_resonator_1_instance.ID[:8]}_Finding Resonator 1.toml"
    pages_to_create.append((finding_resonator_1_instance, finding_resonator_1_instance_path))
    bucket.add_instance(finding_resonator_1_instance_path, finding_resonator_1_instance.ID)

    measuring_resonator_first_try_step = Step(name='First resonator measurement',
                                              user='Smuag',
                                              parent=finding_resonator_freq_task_path,
                                              comments=[f'Could not seem to find anything: \n ![]({raw_figure_path_1})'],
                                             )
    measuring_resonator_first_try_step_path = Path(target,
                                                   f"{measuring_resonator_first_try_step.ID[:8]}_First resonator measurement.toml").resolve()
    finding_resonator_freq_task.add_child(measuring_resonator_first_try_step_path)
    pages_to_create.append((measuring_resonator_first_try_step, measuring_resonator_first_try_step_path))

    finding_resonator_2_path = data_path / 'finding_resonator_2'
    finding_resonator_2_path.mkdir(exist_ok=True)

    finding_resonator_2_star_tag_path = finding_resonator_2_path / '__star__.tag'
    finding_resonator_2_star_tag_path.touch(exist_ok=True)

    data_path_2, raw_figure_path_2, fit_figure_path_2 = simulate_resonator_response(f0=5.0254e9, Q=1000, Qc=10000,
                                                                                    f_start=5e9, f_end=5.05e9,
                                                                                    path=finding_resonator_2_path)
    finding_resonator_2_instance = Instance(name='Finding Resonator 2',
                                            user='Smuag',
                                            parent=bucket_path,
                                            data=[str(data_path_2)],
                                            )

    finding_resonator_2_instance_path = finding_resonator_2_path / f"{finding_resonator_2_instance.ID[:8]}_Finding Resonator .toml"
    pages_to_create.append((finding_resonator_2_instance, finding_resonator_2_instance_path))
    bucket.add_instance(finding_resonator_2_instance_path, finding_resonator_2_instance.ID)

    measuring_resonator_second_try_step = Step(name='Second resonator measurement',
                                               user='Smuag',
                                               parent=finding_resonator_freq_task_path,
                                               comments=[f'Found it at 5.025GHz! \n ![]({fit_figure_path_2})'],
                                                )
    measuring_resonator_second_try_step_path = Path(target,
                                                    f"{measuring_resonator_second_try_step.ID[:8]}_Second resonator measurement.toml").resolve()
    finding_resonator_freq_task.add_child(measuring_resonator_second_try_step_path)
    pages_to_create.append((measuring_resonator_second_try_step, measuring_resonator_second_try_step_path))

    time.sleep(0.5)
    finding_resonator_freq_task.add_comment(f'Done with frequency, moving on to optimizing pi-pulse')
    
    power_rabi_path = data_path / 'power_rabi'
    power_rabi_path.mkdir(exist_ok=True)

    power_rabi_star_tag_path = power_rabi_path / '__star__.tag'
    power_rabi_star_tag_path.touch(exist_ok=True)

    data_path_power_rabi, raw_figure_path_power_rabi, fit_figure_path_power_rabi = simulate_power_rabi(t_start=-1.9, t_end=1.9, path=power_rabi_path)
    
    power_rabi_instance = Instance(name='Power Rabi',
                                   user='Smuag',
                                   parent=bucket_path,
                                   data=[str(data_path_power_rabi)],)

    power_rabi_instance_path = power_rabi_path / f"{power_rabi_instance.ID[:8]}_Power Rabi.toml"
    pages_to_create.append((power_rabi_instance, power_rabi_instance_path))
    bucket.add_instance(power_rabi_instance_path, power_rabi_instance.ID)

    calibrating_power_rabi_step = Step(name='Calibrating Power Rabi',
                                       user='Smuag',
                                       parent=qubit_characterization_project_path,
                                       comments=[f"![]({fit_figure_path_power_rabi}) \n"
                                                 f"Looks good. Pi pulse amp at 0.065 a,p. With pi pulse sigma of 40 "
                                                 f"ns for 6 sigma."],)

    calibrating_power_rabi_step_path = Path(target,
                                            f"{calibrating_power_rabi_step.ID[:8]}_Calibrating Power Rabi.toml").resolve()
    qubit_characterization_project.add_child(calibrating_power_rabi_step_path)
    pages_to_create.append((calibrating_power_rabi_step, calibrating_power_rabi_step_path))

    coherence_times_measurements_task = Task(name='Doing coherence measurements now',
                                             user='Smuag',
                                             parent=qubit_characterization_project_path,
                                             )

    coherence_times_measurements_path = Path(target,
                                                f"{coherence_times_measurements_task.ID[:8]}_Doing coherence measurements now.toml").resolve()
    qubit_characterization_project.add_child(coherence_times_measurements_path)
    pages_to_create.append((coherence_times_measurements_task, coherence_times_measurements_path))

    t1_measurement_path = data_path / 't1_measurement'
    t1_measurement_path.mkdir(exist_ok=True)

    t1_measurement_star_tag_path = t1_measurement_path / '__star__.tag'
    t1_measurement_star_tag_path.touch(exist_ok=True)

    data_path_t1, raw_figure_path_t1, fit_figure_path_t1 = simulate_t1(t_start=0, t_end=300, A=5.82e-05, of=-6.33e-06, tau=3.12e01, path=t1_measurement_path)

    t1_measurement_instance = Instance(name='T1 Measurement',
                                       user='Smuag',
                                       parent=bucket_path,
                                       data=[str(data_path_t1)],)

    t1_measurement_instance_path = t1_measurement_path / f"{t1_measurement_instance.ID[:8]}_T1 Measurement.toml"
    pages_to_create.append((t1_measurement_instance, t1_measurement_instance_path))
    bucket.add_instance(t1_measurement_instance_path, t1_measurement_instance.ID)

    t1_measurement_step = Step(name='T1 Measurement',
                                 user='Smuag',
                                 parent=coherence_times_measurements_path,
                                 comments=[f"![]({fit_figure_path_t1}) \n"
                                          f"31.2 us. Comparable to last time, and I can live with this"],)

    t1_measurement_step_path = Path(target,
                                    f"{t1_measurement_step.ID[:8]}_T1 Measurement.toml").resolve()
    coherence_times_measurements_task.add_child(t1_measurement_step_path)
    pages_to_create.append((t1_measurement_step, t1_measurement_step_path))

    t2_ramsey_measurement_path = data_path / 't2_ramsey_measurement'
    t2_ramsey_measurement_path.mkdir(exist_ok=True)

    t2_ramsey_measurement_star_tag_path = t2_ramsey_measurement_path / '__star__.tag'
    t2_ramsey_measurement_star_tag_path.touch(exist_ok=True)

    data_path_t2_ramsey, raw_figure_path_t2_ramsey, fit_figure_path_t2_ramsey = simulate_t2(t_start=0, t_end=80, A=3.00e-5, of=-1.11e-07, phi=8.10e01, f=2.95e-01, tau=2.87e01, path=t2_ramsey_measurement_path)

    t2_ramsey_measurement_instance = Instance(name='T2 Ramsey Measurement',
                                              user='Smuag',
                                              parent=bucket_path,
                                              data=[str(data_path_t2_ramsey)],)

    t2_ramsey_measurement_instance_path = t2_ramsey_measurement_path / (f"{t2_ramsey_measurement_instance.ID[:8]}_T2 "
                                                                        f"Ramsey Measurement.toml")
    pages_to_create.append((t2_ramsey_measurement_instance, t2_ramsey_measurement_instance_path))
    bucket.add_instance(t2_ramsey_measurement_instance_path, t2_ramsey_measurement_instance.ID)

    t2_ramsey_measurement_step = Step(name='T2 Ramsey Measurement',
                                      user='Smuag',
                                      parent=coherence_times_measurements_path,
                                      comments=[f"!Now for the real moment of truth. Last time it was like 6 us at "
                                                f"best \n[]({fit_figure_path_t2_ramsey}) \n"
                                                f"Hell yeah, 28.7 us. Now there is something else going on in this "
                                                f"decay as we can see the data does not really an exponential decay, "
                                                f"but we can still se the oscillations go on for much longer."],)

    t2_ramsey_measurement_step_path = Path(target, f"{t2_ramsey_measurement_step.ID[:8]}"
                                                   f"_T2 Ramsey Measurement.toml").resolve()
    coherence_times_measurements_task.add_child(t2_ramsey_measurement_step_path)
    pages_to_create.append((t2_ramsey_measurement_step, t2_ramsey_measurement_step_path))

    time.sleep(0.5)
    coherence_times_measurements_task.add_comment("So we went from 5 us to almost 30 us. The things I changed last "
                                                  "time for this qubit was gave it copper clamps, put moly washers on "
                                                  "as many of the screws for the clamps as I could, and moved the "
                                                  "copper braid to the top clamp (because I was worried putting it on "
                                                  "the bottom clamp would not allow for use to really tighten the "
                                                  "screw on for the bottom clamp and cause it be loose)")

    t2_echo_measurement_path = data_path / 't2_echo_measurement'
    t2_echo_measurement_path.mkdir(exist_ok=True)

    t2_echo_measurement_star_tag_path = t2_echo_measurement_path / '__star__.tag'
    t2_echo_measurement_star_tag_path.touch(exist_ok=True)

    data_path_t2_echo, raw_figure_path_t2_echo, fit_figure_path_t2_echo = simulate_t2(t_start=0, t_end=80, A=3.00e-05, of=-1.11e-07, phi=8.10e01, f=2.95e-01, tau=2.87e01, path=t2_echo_measurement_path)

    t2_echo_measurement_instance = Instance(name='T2 Echo Measurement',
                                            user='Smuag',
                                            parent=bucket_path,
                                            data=[str(data_path_t2_echo)],)

    t2_echo_measurement_instance_path = t2_echo_measurement_path / (f"{t2_echo_measurement_instance.ID[:8]}_T2 "
                                                                    f"Echo Measurement.toml")
    pages_to_create.append((t2_echo_measurement_instance, t2_echo_measurement_instance_path))
    bucket.add_instance(t2_echo_measurement_instance_path, t2_echo_measurement_instance.ID)

    t2_echo_measurement_step = Step(name='T2 Echo Measurement',
                                    user='Smuag',
                                    parent=coherence_times_measurements_path,
                                    comments=[f"![]({fit_figure_path_t2_echo}) \n"
                                              f"37 us, not badd. Seems like there is still some slow noise limiting "
                                              f"our setup, but it's not as bad as last time."],)
    t2_echo_measurement_step_path = Path(target, f"{t2_echo_measurement_step.ID[:8]}_T2 Echo Measurement.toml").resolve()
    coherence_times_measurements_task.add_child(t2_echo_measurement_step_path)
    pages_to_create.append((t2_echo_measurement_step, t2_echo_measurement_step_path))

    qubit_characterization_project.add_comment("Now let's check Van IV, the other qubit connected,"
                                               " to see if it is still good")

    for item, item_path in pages_to_create:
        item.to_TOML(item_path)

    return root_path
